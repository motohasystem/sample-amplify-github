import * as cdk from "aws-cdk-lib";
import { Construct } from "constructs";
import { CfnApp, CfnBranch, CfnDomain } from "aws-cdk-lib/aws-amplify";
import * as secretsmanager from "aws-cdk-lib/aws-secretsmanager";
import { BuildSpec } from "aws-cdk-lib/aws-codebuild";
import { exit } from "process";

export class CdkStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id);

        // dotenvファイルを読み込む
        const dotenv = require("dotenv");
        const result = dotenv.config();
        if (result.error) {
            console.log("dotenvファイルの読み込みに失敗しました。", result.error);
            exit(1);
        }

        // dotenvから、AMP_APP_NAMEとGITHUB_REPOSITORYとASM_SECRET_NAMEを取得する
        const appName = process.env.AMP_APP_NAME;
        const githubRepository = process.env.GITHUB_REPOSITORY;
        const asmSecretName = process.env.ASM_SECRET_NAME;
        if (!appName || !githubRepository || !asmSecretName) {
            console.log("dotenvファイルにAMP_APP_NAMEとGITHUB_REPOSITORYとASM_SECRET_NAMEを設定してください。");
            exit(1);
        }

        const githubToken = secretsmanager.Secret.fromSecretNameV2(
            this,
            `GithubAccessToken`,    // ここは適当な名前に変更してください
            asmSecretName,  // // Secrets Managerに登録した「シークレットの名前」
        ).secretValue.unsafeUnwrap();

        const amplifyApp = new CfnApp(this, "AmplifyApp", {
            name: appName,
            oauthToken: githubToken,
            repository: githubRepository,
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
            platform: "WEB",
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
            enableAutoBuild: true,
        });
    }
}
