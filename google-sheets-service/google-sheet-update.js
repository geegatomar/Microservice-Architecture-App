const {google} = require("googleapis");
const mysql = require("mysql2");
const shareSheetWithUser = require(__dirname + "/share-google-sheet.js");

module.exports = async function(obj){

    const auth = new google.auth.GoogleAuth({
        keyFile: "credentials-google.json",
        scopes: "https://www.googleapis.com/auth/spreadsheets",
    });

    // Create client instance for auth
    const client = await auth.getClient().catch(error => { throw error});

    // Instance of Google Sheets API
    const googleSheets = google.sheets({ version: "v4", auth: client });

    // var mySqlConnection = mysql.createConnection({
    //     host: "localhost",
    //     port: 3307,
    //     user: "root",
    //     password: "password",
    //     database: "atlandb",
    //     multipleStatements: true
    // });
    
    // mySqlConnection.connect((err) => {
    //     if(err) {
    //         console.log(err);
    //     } else {
    //         console.log("Connected to MySql at port 3307");
    //     }
    // });

    // TODO: Ideally get this from SQL DB instead  
    const spreadsheetId = "1PUaSfBFCJmjnP999mo5owUAkPNvV3wYt3_yJupke-D4";

    // Get metadata about spreadsheet
    const metaData = await googleSheets.spreadsheets.get({
        auth,
        spreadsheetId,
    }).catch(error => { throw error});

    // Getting contents of each row
    
    let nextRowInSheet = obj["id="];
    let columnHeading = obj["questions"];
    let columns = columnHeading.length;

    // Read rows from spreadsheet
    const getRows = await googleSheets.spreadsheets.values.get({
        auth,
        spreadsheetId,
        range: `Sheet1!A:${getExcelColumnString(columns)}`,
    });
    
    // Write rows to spreadsheet
    if(typeof getRows.data.values == 'undefined') {
        // For adding the heading, when the excel sheet is originally empty.
        await googleSheets.spreadsheets.values.append({
            auth,
            spreadsheetId,
            range: `Sheet1!A:${getExcelColumnString(columns)}`,
            valueInputOption: "RAW",   
            resource: {
            values: [columnHeading],
            },
        }).catch(error => { throw error});

        // Formatting the Google sheets to Freeze the first row.
        await googleSheets.spreadsheets.batchUpdate({
            auth: auth,
            spreadsheetId: spreadsheetId,
            resource: {
                requests: [{
                        "updateSheetProperties": {
                            "properties": {
                                "gridProperties": {
                                    "frozenRowCount": 1,
                                }
                            },
                            "fields": "gridProperties.frozenRowCount"
                        }
                    }],  
              },
            
        }).catch(error => { throw error});

        // Send email to Atlan Clone to share the excel sheet with the user.
        shareSheetWithUser("geegatomar@gmail.com", spreadsheetId);
    }
    await googleSheets.spreadsheets.values.append({
        auth,
        spreadsheetId,
        range: `Sheet1!A:${getExcelColumnString(columns)}`,
        valueInputOption: "RAW",   
        resource: {
        values: [nextRowInSheet],
        },
    }).catch(error => { throw error});
}

// Given the number of columns, it returns the end range string. 
// Example- for 25 its Y, for 27 its AA.
function getExcelColumnString(columnNumber) {
        let columnName = [];
        while (columnNumber > 0) {
            let rem = columnNumber % 26;
            if (rem == 0) {
                columnName.push("Z");
                columnNumber = Math.floor(columnNumber / 26) - 1;
            } else {
                columnName.push(String.fromCharCode((rem - 1) + 'A'.charCodeAt(0)));
                columnNumber = Math.floor(columnNumber / 26);
            }
        }
        return columnName.reverse().join("");
}
