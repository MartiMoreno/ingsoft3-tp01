terraform {
  required_version = ">= 1.5"
  required_providers {
    neon   = { source = "kislerdm/neon", version = "0.18.0" }
    render = { source = "render-oss/render", version = "1.9.1" }
  }
}

provider "neon" {}   # lee NEON_API_KEY del entorno
provider "render" {} # lee RENDER_API_KEY y RENDER_OWNER_ID del entorno

resource "neon_project" "preprod" {
  name                      = "ingsoft3-tp01-preprod"
  region_id                 = "aws-us-east-1" # la misma zona que Render virginia
  history_retention_seconds = 21600           # sin esto el plan gratuito rechaza el primer apply
  org_id                    = var.neon_org_id
}

resource "neon_role" "preprod" {
  project_id = neon_project.preprod.id
  branch_id  = neon_project.preprod.default_branch_id
  name       = "app_preprod_owner"
}

resource "neon_database" "preprod" {
  project_id = neon_project.preprod.id
  branch_id  = neon_project.preprod.default_branch_id
  name       = "app_preprod"
  owner_name = neon_role.preprod.name
}

locals {
  # La cadena de conexión se ARMA con lo que devuelve Neon (formato URI, el que lee DATABASE_URL del backend). Nadie la copia.
  database_url = "postgresql://${neon_role.preprod.name}:${urlencode(neon_role.preprod.password)}@${neon_project.preprod.database_host}/${neon_database.preprod.name}?sslmode=require"
}

resource "render_web_service" "api" {
  name   = "marti-tareas-api-preprod"
  plan   = "free"
  region = var.region
  runtime_source = {
    image = {
      image_url = var.image_repo_api # SIN la etiqueta
      tag       = var.image_tag
    }
  }
  env_vars = {
    DATABASE_URL = { value = local.database_url }
  }
}

resource "render_web_service" "front" {
  name   = "marti-tareas-front-preprod"
  plan   = "free"
  region = var.region
  runtime_source = {
    image = {
      image_url = var.image_repo_front
      tag       = var.image_tag
    }
  }
  env_vars = {
    BACKEND_URL  = { value = trimsuffix(render_web_service.api.url, "/") } # sale de Terraform, sin barra final
    DNS_RESOLVER = { value = "8.8.8.8" }
  }
}
