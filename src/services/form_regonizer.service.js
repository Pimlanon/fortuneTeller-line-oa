const { AzureKeyCredential, DocumentAnalysisClient } = require("@azure/ai-form-recognizer");

const endpoint = process.env.FORM_RECOGNIZER_ENDPOINT;
const key = process.env.FORM_RECOGNIZER_KEY;

const getContentByPage = ({ pages = Array.from([]) }) => {
    let textContent = "";
    for (const page of pages) {
        if (page.lines.length > 0) {
            for (const line of page.lines) {
                textContent += `${line.content}\n`;
            }
        }
    }
    return textContent;
};

const convertBase64ToBuffer = (base64Image) => {
    const base64Data = base64Image.replace(/^data:image\/(png|jpg|jpeg);base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");
    return buffer;
};

const getContentByRead = async ({ formUrl = "" }) => {
    // create your `DocumentAnalysisClient` instance and `AzureKeyCredential` variable
    const client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(key));
    if (formUrl.startsWith("data:")) {
        formUrl = convertBase64ToBuffer(formUrl);
    }
    const poller = await client.beginAnalyzeDocument("prebuilt-read", formUrl);

    const { content, pages, languages, styles } = await poller.pollUntilDone();

    let textContent = "";
    textContent += getContentByPage({ pages });
    if (pages.length <= 0) {
        console.log("No pages were extracted from the document.");
    } else {
    }

    return {textContent};
};

const getContentByLayout = async ({ formUrl = "" }) => {
    const client = new DocumentAnalysisClient(endpoint, new AzureKeyCredential(key));
    if (typeof formUrl === "string" && formUrl.startsWith("data:")) {
        formUrl = convertBase64ToBuffer(formUrl);
    }

    const poller = await client.beginAnalyzeDocument("prebuilt-layout", formUrl);
    const { pages, tables } = await poller.pollUntilDone();

    let textContent = "";
    // textContent += getContentByPage({ pages });

    if (tables.length > 0) {
        let tableCounter = 1;
        for (const table of tables) {
            const { rowCount, columnCount } = table;
            textContent += `\nTables ${tableCounter}:\n`;
            console.log(`- Extracted table: ${table.columnCount} columns, ${table.rowCount} rows (${table.cells.length} cells)`);
            for (const cell of table.cells) {
                const cellContent = cell.content;
                textContent += `${cellContent}`;
                if (cell.columnIndex === columnCount - 1) {
                    textContent += "\n";
                } else {
                    textContent += ", ";
                }
            }
        }
        textContent += "\n\n";
        tableCounter++;
    }
    return { textContent, tables };
};

module.exports = { getContentByRead, getContentByLayout };