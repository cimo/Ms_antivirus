import Express from "express";
import { exec } from "child_process";

// Source
import * as ControllerHelper from "../Controller/Helper";
import * as ControllerUpload from "../Controller/Upload";
import * as ModelHelper from "../Model/Helper";

export const execute = (app: Express.Express) => {
    app.post("/msantivirus/check", (request: Express.Request, response: Express.Response) => {
        void (async () => {
            await ControllerUpload.execute(request)
                .then((result) => {
                    const input = result.response.stdout;

                    exec(`clamdscan "${input}"`, (error, stdout, stderr) => {
                        void (async () => {
                            await ControllerHelper.fileRemove(input)
                                .then()
                                .catch((error: Error) => {
                                    ControllerHelper.writeLog(
                                        "Antivirus.ts - ControllerHelper.fileRemove() - input error: ",
                                        ControllerHelper.objectOutput(error)
                                    );
                                });

                            if (stdout !== "" && stderr === "") {
                                response.status(200).send({ response: { stdout, stderr } });
                            } else if (stdout === "" && stderr !== "") {
                                ControllerHelper.writeLog("Antivirus.ts - exec(`clamdscan ... - stderr: ", result.response.stderr);

                                response.status(500).send({ response: { stdout, stderr } });
                            } else {
                                response.status(200).send({ response: { stdout, stderr } });
                            }
                        })();
                    });
                })
                .catch((result: ModelHelper.IresponseExecute) => {
                    ControllerHelper.writeLog("Antivirus.ts - /msantivirus/check - stderr: ", result.response.stderr);

                    response.status(500).send({
                        stdout: result.response.stdout,
                        stderr: result.response.stderr
                    });
                });
        })();
    });

    app.post("/msantivirus/update", (request: Express.Request, response: Express.Response) => {
        const requestBody = request.body as ModelHelper.IrequestBody;

        const checkToken = ControllerHelper.checkToken(requestBody.token_api);

        if (checkToken) {
            exec("freshclam", (error, stdout, stderr) => {
                if (stdout !== "" && stderr === "") {
                    response.status(200).send({ response: { stdout, stderr } });
                } else if (stdout === "" && stderr !== "") {
                    ControllerHelper.writeLog("Antivirus.ts - exec(`freshclam ... - stderr: ", stderr);

                    response.status(500).send({ response: { stdout, stderr } });
                } else {
                    response.status(200).send({ response: { stdout, stderr } });
                }
            });
        } else {
            ControllerHelper.writeLog("Antivirus.ts - /msantivirus/update - tokenWrong: ", requestBody.token_api);

            response.status(500).send({
                stdout: "",
                stderr: `tokenWrong: ${requestBody.token_api}`
            });
        }
    });
};
