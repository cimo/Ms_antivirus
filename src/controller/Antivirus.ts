import Express, { Request, Response } from "express";
import { execFile } from "child_process";
import { Ca } from "@cimo/authentication/dist/src/Main";

// Source
import * as helperSrc from "../HelperSrc";
import ControllerUpload from "./Upload";

export default class ControllerAntivirus {
    // Variable
    private app: Express.Express;
    private controllerUpload: ControllerUpload;

    // Method
    constructor(app: Express.Express) {
        this.app = app;
        this.controllerUpload = new ControllerUpload();
    }

    api = (): void => {
        this.app.get("/api/update", Ca.authenticationMiddleware, (_, response: Response) => {
            const execCommand = `. ${helperSrc.PATH_ROOT}${helperSrc.PATH_FILE_SCRIPT}command1.sh`;
            const execArgumentList: string[] = [];

            execFile(execCommand, execArgumentList, { shell: "/bin/bash", encoding: "utf8" }, (_, stdout, stderr) => {
                if ((stdout !== "" && stderr === "") || (stdout !== "" && stderr !== "")) {
                    helperSrc.responseBody(stdout, stderr, response, 200);
                } else if (stdout === "" && stderr !== "") {
                    helperSrc.writeLog("Antivirus.ts - api() - post(/api/update) - execFile(freshclam) - stderr", stderr);

                    helperSrc.responseBody("", stderr, response, 500);
                }
            });
        });

        this.app.post("/api/check", Ca.authenticationMiddleware, (request: Request, response: Response) => {
            void (async () => {
                await this.controllerUpload
                    .execute(request, true)
                    .then((resultControllerUploadList) => {
                        let filename = "";

                        for (const resultControllerUpload of resultControllerUploadList) {
                            if (resultControllerUpload.name === "file" && resultControllerUpload.filename) {
                                filename = resultControllerUpload.filename;

                                break;
                            }
                        }

                        const input = `${helperSrc.PATH_ROOT}${helperSrc.PATH_FILE_INPUT}${filename}`;

                        const execCommand = `. ${helperSrc.PATH_ROOT}${helperSrc.PATH_FILE_SCRIPT}command2.sh`;
                        const execArgumentList = [`"${input}"`];

                        execFile(execCommand, execArgumentList, { shell: "/bin/bash", encoding: "utf8" }, (_, stdout, stderr) => {
                            helperSrc.fileRemove(input, (resultFileRemove) => {
                                if (resultFileRemove) {
                                    if ((stdout !== "" && stderr === "") || (stdout !== "" && stderr !== "")) {
                                        helperSrc.responseBody(stdout, stderr, response, 200);
                                    } else if (stdout === "" && stderr !== "") {
                                        helperSrc.writeLog(
                                            "Antivirus.ts - api() - post(/api/check) - execute() - execFile(clamdscan) - stderr",
                                            stderr
                                        );

                                        helperSrc.responseBody("", stderr, response, 500);
                                    }
                                } else {
                                    helperSrc.writeLog(
                                        "Antivirus.ts - api() - post(/api/check) - execute() - execFile(clamdscan) - fileRemove()",
                                        resultFileRemove.toString()
                                    );

                                    helperSrc.responseBody("", resultFileRemove.toString(), response, 500);
                                }
                            });
                        });
                    })
                    .catch((error: Error) => {
                        helperSrc.writeLog("Antivirus.ts - api() - post(/api/check) - execute() - catch()", error);

                        helperSrc.responseBody("", error, response, 500);
                    });
            })();
        });
    };
}
