import Express, { Request, Response } from "express";
import { RateLimitRequestHandler } from "express-rate-limit";
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
            const execCommand = `${helperSrc.PATH_ROOT}${helperSrc.PATH_SCRIPT}command1.sh`;
            const execArgumentList = [execCommand];

            helperSrc.executionFile(execArgumentList).then((result) => {
                if (result.error) {
                    helperSrc.writeLog(`Antivirus.ts - api() - get(/api/update) - executionFile() - error`, result.error.message);

                    helperSrc.responseBody("", result.error.message, response, 500);

                    return;
                }

                if ((result.stdout !== "" && result.stderr === "") || (result.stdout !== "" && result.stderr !== "")) {
                    helperSrc.writeLog("Antivirus.ts - api() - get(/api/update) - executionFile() - stdout", result.stdout);

                    helperSrc.responseBody(result.stdout, "", response, 200);
                } else if (result.stdout === "" && result.stderr !== "") {
                    helperSrc.writeLog("Antivirus.ts - api() - get(/api/update) - executionFile() - stderr", result.stderr);

                    helperSrc.responseBody("", result.stderr, response, 500);
                }
            });
        });

        this.app.post("/api/check", this.limiter, Ca.authenticationMiddleware, (request: Request, response: Response) => {
            this.controllerUpload
                .execute(request, true, false, `${helperSrc.PATH_ROOT}${helperSrc.PATH_FILE}input/`)
                .then((resultControllerUploadList) => {
                    let fileName = "";

                    for (let a = 0; a < resultControllerUploadList.length; a++) {
                        const resultControllerUpload = resultControllerUploadList[a];

                        if (resultControllerUpload.name === "file" && resultControllerUpload.fileName) {
                            fileName = resultControllerUpload.fileName;

                            break;
                        }
                    }

                    const fileDetail = helperSrc.fileDetail(fileName);

                    const input = `${helperSrc.PATH_ROOT}${helperSrc.PATH_FILE}input/${fileDetail.baseName}/${fileName}`;
                    const inputFolder = `${helperSrc.PATH_ROOT}${helperSrc.PATH_FILE}input/${fileDetail.baseName}/`;

                    const execCommand = `${helperSrc.PATH_ROOT}${helperSrc.PATH_SCRIPT}command2.sh`;
                    const execArgumentList = [execCommand, input];

                    helperSrc.executionFile(execArgumentList).then((result) => {
                        if (result.error) {
                            helperSrc.writeLog(`Antivirus.ts - api() - post(/api/check) - executionFile() - error`, result.error.message);

                            helperSrc.responseBody("", result.error.message, response, 500);

                            return;
                        }

                        if ((result.stdout !== "" && result.stderr === "") || (result.stdout !== "" && result.stderr !== "")) {
                            helperSrc.writeLog("Antivirus.ts - api() - post(/api/check) - execute() - executionFile() - stdout", result.stdout);

                            helperSrc.responseBody(result.stdout, "", response, 200);
                        } else if (result.stdout === "" && result.stderr !== "") {
                            helperSrc.writeLog("Antivirus.ts - api() - post(/api/check) - execute() - executionFile() - stderr", result.stderr);

                            helperSrc.responseBody("", result.stderr, response, 500);
                        }

                        helperSrc.fileOrFolderDelete(inputFolder, (resultFileDelete) => {
                            if (typeof resultFileDelete !== "boolean") {
                                helperSrc.writeLog(
                                    "Antivirus.ts - api() - post(/api/check) - execute() - executionFile() - fileOrFolderDelete(inputFolder)",
                                    resultFileDelete.toString()
                                );
                            }
                        });
                    });
                })
                .catch((error: Error) => {
                    helperSrc.writeLog("Antivirus.ts - api() - post(/api/check) - execute() - catch()", error.message);

                    helperSrc.responseBody("", "ko", response, 500);
                });
        });
    };
}
