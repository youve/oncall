load('ext://uibutton', 'cmd_button', 'location', 'text_input', 'bool_input')
load("ext://configmap", "configmap_create")

running_under_parent_tiltfile = os.getenv("TILT_PARENT", "false") == "true"
twilio_values=[
    "oncall.twilio.accountSid=" + os.getenv("TWILIO_ACCOUNT_SID", ""),
    "oncall.twilio.authToken=" + os.getenv("TWILIO_AUTH_TOKEN", ""),
    "oncall.twilio.phoneNumber=" + os.getenv("TWILIO_PHONE_NUMBER", ""),
    "oncall.twilio.verifySid=" + os.getenv("TWILIO_VERIFY_SID", ""),
]
is_ci=config.tilt_subcommand == "ci"
# HELM_PREFIX must be "oncall-dev" as it is hardcoded in dev/helm-local.yml
HELM_PREFIX = "oncall-dev"
# Use docker registery generated by ctlptl (dev/kind-config.yaml)
DOCKER_REGISTRY = "localhost:63628/"

load("ext://docker_build_sub", "docker_build_sub")

# Tell ops-devenv/Tiltifle where our plugin.json file lives
plugin_file = os.path.abspath("grafana-plugin/src/plugin.json")

def plugin_json():
    return plugin_file


allow_k8s_contexts(["kind-kind"])

# Build the image including frontend folder for pytest
docker_build_sub(
    "localhost:63628/oncall/engine:dev",
    context="./engine",
    cache_from=["grafana/oncall:latest", "grafana/oncall:dev"],
    ignore=["./test-results/", "./grafana-plugin/dist/", "./grafana-plugin/e2e-tests/", "./grafana-plugin/node_modules/"],
    child_context=".",
    target="dev",
    extra_cmds=["ADD ./grafana-plugin/src/plugin.json /etc/grafana-plugin/src/plugin.json"],
    live_update=[
        sync("./engine/", "/etc/app"),
        run(
            "cd /etc/app && pip install pip-tools && pip-sync",
            trigger="./engine/requirements.txt",
        ),
    ],
)


def load_oncall_helm():
    helm_oncall_values = ["./dev/helm-local.yml", "./dev/helm-local.dev.yml"]
    if is_ci:
        helm_oncall_values = helm_oncall_values + ["./.github/helm-ci.yml"]
    yaml = helm("helm/oncall", name=HELM_PREFIX, values=helm_oncall_values, set=twilio_values, namespace="default")
    k8s_yaml(yaml)

# --- GRAFANA START ----

# Generate and load the grafana deploy yaml
configmap_create(
    "grafana-oncall-app-provisioning",
    namespace="default",
    from_file="dev/grafana/provisioning/plugins/grafana-oncall-app-provisioning.yaml",
)

if not running_under_parent_tiltfile:
    # Load the custom Grafana extensions
    v1alpha1.extension_repo(
        name="grafana-tilt-extensions",
        ref="v1.4.2",
        url="https://github.com/grafana/tilt-extensions",
    )
v1alpha1.extension(
    name="grafana", repo_name="grafana-tilt-extensions", repo_path="grafana"
)
load("ext://grafana", "grafana")

def load_grafana():
    # The user/pass that you will login to Grafana with
    grafana_admin_user_pass = os.getenv("GRAFANA_ADMIN_USER_PASS", "oncall")
    grafana_version = os.getenv("GRAFANA_VERSION", "latest")


    k8s_resource(
        objects=["grafana-oncall-app-provisioning:configmap"],
        new_name="grafana-oncall-app-provisioning-configmap",
        resource_deps=["build-ui"],
        labels=["Grafana"],
    )

    # Use separate grafana helm chart
    if not running_under_parent_tiltfile:
        grafana(
            grafana_version=grafana_version,
            context="grafana-plugin",
            plugin_files=["grafana-plugin/src/plugin.json"],
            namespace="default",
            deps=["grafana-oncall-app-provisioning-configmap", "build-ui", "build-oncall-plugin-backend"],
            extra_env={
                "GF_SECURITY_ADMIN_PASSWORD": "oncall",
                "GF_SECURITY_ADMIN_USER": "oncall",
                "GF_AUTH_ANONYMOUS_ENABLED": "false",
                "GF_APP_URL": "http://grafana:3000",  # older versions of grafana need this
                "GF_SERVER_ROOT_URL": "http://grafana:3000",
                "GF_FEATURE_TOGGLES_ENABLE": "externalServiceAccounts",
                "ONCALL_API_URL": "http://oncall-dev-engine:8080"
            },
        )
# --- GRAFANA END ----


def get_profiles():
    profiles = os.getenv('ONCALL_PROFILES', 'grafana,plugin,backend,tests')
    return profiles.split(',')
profiles = get_profiles()

if 'grafana' in profiles:
    load_grafana()
if 'plugin' in profiles:
    include(".tilt/plugin/Tiltfile")
if 'backend' in profiles:
    load_oncall_helm()
    include(".tilt/backend/Tiltfile")
    include(".tilt/deps/Tiltfile")
if 'tests' in profiles:
    include(".tilt/tests/Tiltfile")

# name all tilt resources after the k8s object namespace + name
def resource_name(id):
    # Remove variable date from job name
    if id.name.startswith(HELM_PREFIX + "-engine-migrate"):
        return "engine-migrate"
    return id.name.replace(HELM_PREFIX + "-", "")

workload_to_resource_function(resource_name)
