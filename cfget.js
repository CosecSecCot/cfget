#!/usr/bin/env node

import express, { json } from "express";
import {
    existsSync,
    // readdirSync,
    unlinkSync,
    writeFileSync,
    mkdirSync,
    // rmdirSync,
    // statSync,
} from "fs";
import { join } from "path";
import { Command } from "commander";
import chalk from "chalk";

const app = express();
const PORT = 1327;
const cwd = process.cwd();
const program = new Command();

const seperator = "~~~~~~~~~~";

program
    .name("cfget")
    .description("CLI to get Codeforces Problems using Competitive Companion.")
    .version("1.0.0")
    // .option("-r, --remove", "Remove all files in the directory.")
    .option("-d, --debug", "Print json request body.");

program.parse();

const options = program.opts();

app.use(json());

/**
 * Handles the POST request from Competitive Companion to receive problem data.
 * @param {Object} req - The request object.
 * @param {Object} res - The response object.
 */
app.post("/", (req, res) => {
    const data = req.body;

    console.log(`\n${seperator}`);
    if (options.debug) {
        console.log(
            "Received data:",
            chalk.grey(JSON.stringify(data, null, 0))
        );
        console.log("");
    }

    const problemId = getProblemId(data);
    saveProblemData(data, problemId);

    res.sendStatus(200);
});

app.listen(PORT, () => {
    console.log(`Server listening on port ${chalk.yellowBright.bold(PORT)}`);
});

/**
 * @param {Object} data - Problem data received from Competitive Companion.
 * @returns {string} Problem Id (e.g., 'a', 'b', 'c').
 */
function getProblemId(data) {
    const match = data.name.match(/([A-Z])/);
    return match ? match[1].toLowerCase() : "a";
}

/**
 * @param {Object} data - Problem data received from Competitive Companion.
 * @param {string} problemId - (e.g., 'a', 'b', 'c').
 */
function saveProblemData(data, problemId) {
    const inputFileName = join(cwd, "input");
    if (!existsSync(inputFileName)) {
        console.log("Created file", chalk.bold("input"));
        writeFileSync(inputFileName, "");
    }

    const cppFileName = join(cwd, `${problemId}.cpp`);
    if (existsSync(cppFileName)) {
        unlinkSync(cppFileName);
        console.log(chalk.grey(`Deleted existing ${chalk.bold(cppFileName)}`));
    }
    writeFileSync(cppFileName, "");
    console.log("Created", chalk.bold(`${problemId}.cpp`));

    const testDir = join(cwd, "tests");
    if (!existsSync(testDir)) {
        mkdirSync(testDir, { recursive: true });
    }

    console.log(chalk.bold(`${data.tests.length} Testcases`));

    for (let i = 0; i < data.tests.length; i++) {
        // const inputFileName = join(testDir, `${problemId}.in${i + 1}`);
        const inputFileName = join(testDir, `${problemId}${i + 1}`);
        // const expectedOutputFileName = join(cwd, `${problemId}.ans${i + 1}`);
        if (existsSync(inputFileName)) {
            unlinkSync(inputFileName);
            console.log(
                chalk.grey(
                    `Deleted existing ${chalk.bold(`${problemId}${i + 1}`)}`
                )
            );
        }
        // if (existsSync(expectedOutputFileName)) {
        //     unlinkSync(expectedOutputFileName);
        //     console.log(
        //         chalk.red(
        //             `Deleted existing ${chalk.bold(expectedOutputFileName)}`
        //         )
        //     );
        // }

        writeFileSync(inputFileName, data.tests[i].input);
        // console.log(`Saved input sample to ${inputFileName}`);

        // writeFileSync(expectedOutputFileName, data.tests[i].output);
        // console.log(`Saved expected output to ${expectedOutputFileName}`);
    }
}

// function deleteAllFilesAndDirs(directory) {
//     const files = readdirSync(directory);
//     files.forEach((file) => {
//         const filePath = join(directory, file);
//         const fileStat = statSync(filePath);
//         if (fileStat.isDirectory()) {
//             deleteAllFilesAndDirs(filePath); // Recursively delete directory contents
//             rmdirSync(filePath); // Delete the directory itself
//             console.log(chalk.red(`Deleted directory ${filePath}`));
//         } else {
//             unlinkSync(filePath); // Delete the file
//             console.log(chalk.red(`Deleted file ${filePath}`));
//         }
//     });
// }
