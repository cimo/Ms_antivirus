import Express, { Request, Response } from "express";
import { RateLimitRequestHandler } from "express-rate-limit";
import { execFile } from "child_process";
import { Ca } from "@cimo/authentication/dist/src/Main.js";

// Source
import * as helperSrc from "../HelperSrc.js";
import ControllerUpload from "./Upload.js";

export default class Antivirus {
    // Variable
    private app: Express.Express;
    private limiter: RateLimitRequestHandler;
    private controllerUpload: ControllerUpload;

    // Method
    constructor(app: Express.Express, limiter: RateLimitRequestHandler) {
        this.app = app;
        this.limiter = limiter;
        this.controllerUpload = new ControllerUpload();
    }

    api = (): void => {
        this.app.get("/api/update", this.limiter, Ca.authenticationMiddleware, (_, response: Response) => {
            const execCommand = `. ${helperSrc.PATH_ROOT}${helperSrc.PATH_SCRIPT}command1.sh`;
            const execArgumentList: string[] = [];

            execFile(execCommand, execArgumentList, { shell: "/bin/bash", encoding: "utf8" }, (_, stdout, stderr) => {
                if ((stdout !== "" && stderr === "") || (stdout !== "" && stderr !== "")) {
                    helperSrc.writeLog("Antivirus.ts - api() - post(/api/update) - execFile() - stdout/stderr", `${stdout}\n${stderr}`);

                    helperSrc.responseBody(stdout, stderr, response, 200);
                } else if (stdout === "" && stderr !== "") {
                    helperSrc.writeLog("Antivirus.ts - api() - post(/api/update) - execFile() - stderr", stderr);

                    helperSrc.responseBody("", stderr, response, 500);
                }
            });
        });

        this.app.post("/api/check", this.limiter, Ca.authenticationMiddleware, (request: Request, response: Response) => {
            this.controllerUpload
                .execute(request, true)
                .then((resultControllerUploadList) => {
                    let fileName = "";

                    for (const resultControllerUpload of resultControllerUploadList) {
                        if (resultControllerUpload.name === "file" && resultControllerUpload.fileName) {
                            fileName = resultControllerUpload.fileName;

                            break;
                        }
                    }

                    const input = `${helperSrc.PATH_ROOT}${helperSrc.PATH_FILE}input/${fileName}`;

                    const execCommand = `. ${helperSrc.PATH_ROOT}${helperSrc.PATH_SCRIPT}command2.sh`;
                    const execArgumentList = [`"${input}"`];

                    execFile(execCommand, execArgumentList, { shell: "/bin/bash", encoding: "utf8" }, (_, stdout, stderr) => {
                        helperSrc.fileOrFolderRemove(input, (resultFileRemove) => {
                            if (typeof resultFileRemove !== "boolean") {
                                helperSrc.writeLog(
                                    "Antivirus.ts - api() - post(/api/check) - execute() - execFile() - fileOrFolderRemove(input)",
                                    resultFileRemove.toString()
                                );

                                helperSrc.responseBody("", resultFileRemove.toString(), response, 500);
                            }
                        });

                        if ((stdout !== "" && stderr === "") || (stdout !== "" && stderr !== "")) {
                            helperSrc.writeLog(
                                "Antivirus.ts - api() - post(/api/check) - execute() - execFile() - stdout/stderr",
                                `${stdout}\n${stderr}`
                            );

                            helperSrc.responseBody(stdout, stderr, response, 200);
                        } else if (stdout === "" && stderr !== "") {
                            helperSrc.writeLog("Antivirus.ts - api() - post(/api/check) - execute() - execFile() - stderr", stderr);

                            helperSrc.responseBody("", stderr, response, 500);
                        }
                    });
                })
                .catch((error: Error) => {
                    helperSrc.writeLog("Antivirus.ts - api() - post(/api/check) - execute() - catch()", error);

                    helperSrc.responseBody("", error, response, 500);
                });
        });
    };
}
