import Express, { Request, Response } from "express";
import { RateLimitRequestHandler } from "express-rate-limit";
import { Ca } from "@cimo/authentication/dist/src/Main.js";

// Source
import * as helperSrc from "../HelperSrc.js";
import ControllerUpload from "./Upload.js";

export default class Service {
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
            const pathExecutionCommand = `${helperSrc.PATH_ROOT}${helperSrc.PATH_SCRIPT}command1.sh`;
            const executionArgumentList = [pathExecutionCommand];

            helperSrc.executionFile(executionArgumentList).then((result) => {
                if (result.error) {
                    helperSrc.writeLog(`Service.ts - api() - get(/api/update) - executionFile() - error`, result.error.message);

                    helperSrc.responseBody({ state: "ko", message: result.error.message }, response, 500);

                    return;
                }

                if (result.stdout === "" && result.stderr !== "") {
                    helperSrc.writeLog("Service.ts - api() - get(/api/update) - executionFile() - stderr", result.stderr);

                    helperSrc.responseBody({ state: "ko", message: result.stderr }, response, 500);
                } else if ((result.stdout !== "" && result.stderr === "") || (result.stdout !== "" && result.stderr !== "")) {
                    helperSrc.writeLog("Service.ts - api() - get(/api/update) - executionFile() - stdout", result.stdout);

                    helperSrc.responseBody({ state: "ok", message: "", data: result.stdout }, response, 200);
                }
            });
        });

        this.app.post("/api/check", this.limiter, Ca.authenticationMiddleware, (request: Request, response: Response) => {
            const uniqueId = helperSrc.generateUniqueId();

            this.controllerUpload
                .execute(request, true, false, `${helperSrc.PATH_ROOT}${helperSrc.PATH_FILE}input/${uniqueId}/`)
                .then(async (resultControllerUploadList) => {
                    let fileName = "";

                    for (let a = 0; a < resultControllerUploadList.length; a++) {
                        const resultControllerUpload = resultControllerUploadList[a];

                        if (resultControllerUpload.name === "file" && resultControllerUpload.fileName) {
                            fileName = resultControllerUpload.fileName;

                            break;
                        }
                    }

                    const fileDetail = await helperSrc.fileDetail(fileName);

                    const pathInput = `${helperSrc.PATH_ROOT}${helperSrc.PATH_FILE}input/${uniqueId}/${fileDetail.baseName}/${fileName}`;
                    const pathInputBasename = `${helperSrc.PATH_ROOT}${helperSrc.PATH_FILE}input/${uniqueId}/`;

                    const pathExecutionCommand = `${helperSrc.PATH_ROOT}${helperSrc.PATH_SCRIPT}command2.sh`;
                    const executionArgumentList = [pathExecutionCommand, pathInput];

                    helperSrc.executionFile(executionArgumentList).then(async (result) => {
                        if (result.error) {
                            helperSrc.writeLog(`Service.ts - api() - post(/api/check) - executionFile() - error`, result.error.message);

                            helperSrc.responseBody({ state: "ko", message: result.error.message }, response, 500);
                        } else if (result.stdout === "" && result.stderr !== "") {
                            helperSrc.writeLog("Service.ts - api() - post(/api/check) - execute() - executionFile() - stderr", result.stderr);

                            helperSrc.responseBody({ state: "ko", message: result.stderr }, response, 500);
                        } else if ((result.stdout !== "" && result.stderr === "") || (result.stdout !== "" && result.stderr !== "")) {
                            helperSrc.writeLog("Service.ts - api() - post(/api/check) - execute() - executionFile() - stdout", result.stdout);

                            helperSrc.responseBody({ state: "ok", message: "", data: result.stdout }, response, 200);
                        }

                        const fileOrFolderDelete = await helperSrc.fileOrFolderDelete(pathInputBasename);

                        if (typeof fileOrFolderDelete !== "boolean") {
                            helperSrc.writeLog(
                                "Service.ts - api() - post(/api/check) - execute() - executionFile() - fileOrFolderDelete(pathInputBasename)",
                                fileOrFolderDelete.toString()
                            );
                        }
                    });
                })
                .catch((error: Error) => {
                    helperSrc.writeLog("Service.ts - api() - post(/api/check) - execute() - catch()", error.message);

                    helperSrc.responseBody({ state: "ko", message: error.message }, response, 500);
                });
        });
    };
}
