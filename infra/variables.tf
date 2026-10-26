variable "image_repo_api" {
  default = "ghcr.io/martimoreno/ingsoft3-tp01-backend"
}
variable "image_repo_front" {
  default = "ghcr.io/martimoreno/ingsoft3-tp01-frontend"
}
variable "image_tag" {
  default = "sha-0245cab273f14ffe036efcdfbea2b0a791875d46" # la imagen de v7.0.0 (la que está en PROD)
}
variable "region" {
  default = "virginia"
}
variable "neon_org_id" {
  description = "Id de la organización de Neon (org-...). Se pasa por TF_VAR_neon_org_id, no se escribe en el repo."
  type        = string
}
