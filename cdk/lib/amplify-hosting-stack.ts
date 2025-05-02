import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { CfnApp, CfnBranch, CfnDomain } from "aws-cdk-lib/aws-amplify";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { BuildSpec } from "aws-cdk-lib/aws-codebuild";
import { exit } from "process";

export class CdkStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id);

        const githubToken = secretsmanager.Secret.fromSecretNameV2(
            this,
            `GithubAccessToken`,    // ここは適当な名前に変更してください
            `github-access-token`,  // // Secrets Managerに登録した「シークレットの名前」
        ).secretValue.unsafeUnwrap();

        const amplifyApp = new CfnApp(this, "AmplifyApp", {
            name: 'dev-organization-homes-motohashi',
            oauthToken: githubToken,
            repository: "https://github.com/motohasystem/sample-amplify-github",
            environmentVariables: [
                {
                    name: "AMPLIFY_MONOREPO_APP_ROOT",
                    value: "frontend",
                },
            ],
            buildSpec: BuildSpec.fromObjectToYaml({
                version: 1,
                applications: [
                    {
                        appRoot: "frontend",
                        frontend: {
                            phases: {
                                preBuild: {
                                    commands: ["npm install"],
                                },
                                build: {
                                    commands: [
                                        "npm run build",
                                    ],
                                },
                            },
                            artifacts: {
                                baseDirectory: "dist",
                                files: ["**/*"],
                            },
                            cache: {
                                paths: ["node_modules/**/*"],
                            },
                        },
                    },
                ],
            }).toBuildSpec(),
            platform: "WEB_COMPUTE",
            customRules: [
                {
                    source: "/<*>",
                    target: "/index.html",
                    status: "404-200",
                },
            ],
        });

        new CfnBranch(this, "AmplifyBranch", {
            appId: amplifyApp.attrAppId,
            branchName: 'main',
            framework: "none",
            enableAutoBuild: true,
        });
    }
}
