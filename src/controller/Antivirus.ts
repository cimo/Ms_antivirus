import Express from "express";
import { exec } from "child_process";

// Source
import * as ControllerHelper from "../controller/Helper";
import * as ControllerUpload from "../controller/Upload";
import * as ModelHelper from "../model/Helper";

export const execute = (app: Express.Express) => {
    app.post("/msantivirus/check", (request: Express.Request, response: Express.Response) => {
        void (async () => {
            await ControllerUpload.execute(request)
                .then((result) => {
                    exec(`clamdscan "${result}"`, (error, stdout, stderr) => {
                        void (async () => {
                            await ControllerHelper.fileRemove(result)
                                .then()
                                .catch((error: Error) => {
                                    ControllerHelper.writeLog(
                                        "Antivirus.ts - ControllerHelper.fileRemove() - catch error: ",
                                        ControllerHelper.objectOutput(error)
                                    );
                                });

                            if (stdout !== "" && stderr === "") {
                                ControllerHelper.responseBody(stdout, "", response, 200);
                            } else if (stdout === "" && stderr !== "") {
                                ControllerHelper.writeLog("Antivirus.ts - exec(`clamdscan ... - stderr: ", stderr);

                                ControllerHelper.responseBody("", stderr, response, 500);
                            } else {
                                ControllerHelper.responseBody(stdout, "", response, 200);
                            }
                        })();
                    });
                })
                .catch((error: Error) => {
                    ControllerHelper.writeLog("Antivirus.ts - /msantivirus/check - catch error: ", ControllerHelper.objectOutput(error));

                    ControllerHelper.responseBody("", error, response, 500);
                });
        })();
    });

    app.post("/msantivirus/update", (request: Express.Request, response: Express.Response) => {
        const requestBody = request.body as ModelHelper.IrequestBody;

        const checkToken = ControllerHelper.checkToken(requestBody.token_api);

        if (checkToken) {
            exec("freshclam", (error, stdout, stderr) => {
                if (stdout !== "" && stderr === "") {
                    ControllerHelper.responseBody(stdout, "", response, 200);
                } else if (stdout === "" && stderr !== "") {
                    ControllerHelper.writeLog("Antivirus.ts - exec(`freshclam ... - stderr: ", stderr);

                    ControllerHelper.responseBody("", stderr, response, 500);
                } else {
                    ControllerHelper.responseBody(stdout, "", response, 200);
                }
            });
        } else {
            ControllerHelper.writeLog("Antivirus.ts - /msantivirus/update - tokenWrong: ", requestBody.token_api);

            ControllerHelper.responseBody("", `tokenWrong: ${requestBody.token_api}`, response, 500);
        }
    });
};
