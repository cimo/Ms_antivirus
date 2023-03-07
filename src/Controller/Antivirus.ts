import Cmd from "node-cmd";
import Express from "express";
import Multer from "multer";

// Source
import * as ControllerHelper from "../Controller/Helper";
import * as ModelError from "../Model/Error";

export const execute = (app: Express.Express, parser: Express.RequestHandler, multer: Multer.Multer): void => {
    app.post("/msantivirus/update", parser, async (req: Express.Request, res: Express.Response) => {
        ControllerHelper.writeLog("Antivirus.ts =>", "/msantivirus/update");

        ControllerHelper.checkRequest(req);

        if (req.body.checkRequest && req.body.checkRequest.tokenWrong === "") {
            Cmd.run("freshclam --quiet", async (cmdError: ModelError.Cmd) => {
                if (cmdError) {
                    ControllerHelper.writeLog("Upload.ts => /msantivirus/update", `Cmd.run(freshclam ... - cmdError: ${cmdError}`);

                    res.status(500).send({ Error: "Update fail!" });
                } else {
                    res.status(200).send({ Response: "ok" });
                }
            });
        } else if (req.body.checkRequest && req.body.checkRequest.tokenWrong !== "") {
            res.status(500).send({ Error: `Token wrong: ${req.body.checkRequest.tokenWrong}` });
        } else {
            res.status(500).send({ Error: "System error." });
        }
    });

    app.post("/msantivirus/check", multer.single("file"), async (req: Express.Request, res: Express.Response) => {
        ControllerHelper.writeLog("Upload.ts => /msantivirus/check", `req.body: ${ControllerHelper.objectOutput(req.body)} / req.file: ${ControllerHelper.objectOutput(req.file)}`);

        if (req.file && req.body.checkRequest && req.body.checkRequest.tokenWrong === "" && req.body.checkRequest.parameterNotFound === "" && req.body.checkRequest.mimeTypeWrong === "") {
            const input = `./${req.file.path}`;

            Cmd.run(`clamdscan ${input}`, async (cmdError: ModelError.Cmd) => {
                if (cmdError) {
                    ControllerHelper.writeLog("Upload.ts => /msantivirus/check", `clamdscan -r ... - cmdError: ${cmdError}`);

                    ControllerHelper.fileRemove(input);

                    res.status(500).send({ Error: `File: ${input} NOT safe!` });
                } else {
                    ControllerHelper.fileRemove(input);

                    res.status(200).send({ Response: "ok" });
                }
            });
        } else if (req.body.checkRequest && req.body.checkRequest.tokenWrong !== "") {
            res.status(500).send({ Error: `Token wrong: ${req.body.checkRequest.tokenWrong}` });
        } else if (req.body.checkRequest && req.body.checkRequest.parameterNotFound !== "") {
            res.status(500).send({ Error: `Parameter not found: ${req.body.checkRequest.parameterNotFound}` });
        } else if (req.body.checkRequest && req.body.checkRequest.mimeTypeWrong !== "") {
            res.status(500).send({ Error: `Mime type worng: ${req.body.checkRequest.mimeTypeWrong}` });
        } else {
            res.status(500).send({ Error: "File not found." });
        }
    });
};
