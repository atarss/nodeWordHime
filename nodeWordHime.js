var http = require('http'),url = require('url');
var serverPort = 9615;
var defaultCommand = "!about"; //You can change it to a wordlist.

function startServer(request, response) {
  var urlText = request.url.slice(1);
  if (urlText == "")  urlText = defaultCommand;
  var finalOutput = "";
  response.writeHead(200, {'Content-Type': 'text/plain'});
  
  function listWords(response,finalOutput) {
    var execListWords = require('child_process').exec;
    var getListWords = execListWords('ls ./list | grep .csv',
      function (error, stdout, stderr) {
        finalOutput += "Word Lists : \n";
        finalOutput += stdout;
        response.end(finalOutput);
      }
    );
  }

  if (urlText.charAt(0) == '!') {
    // Control Mode
    var controlText = urlText.slice(1).toLowerCase();

    switch (controlText) {
      case "list" : {
        listWords(response, finalOutput); 
        break;
      }
      case "exit" : {
        finalOutput += "Server terminated.\n";
        response.end(finalOutput);
        console.log("Server terminated by a exit request.\n");
        process.exit(0);
        break;
      }
      case "about" : { }
      default : {
        finalOutput += "About... \nTo be continued.\n";
        response.end(finalOutput);
      }
    }
  } else {
    // Words Mode
    var wordsMode = 0; //0:Normal(Random) , 1:Set Line Number , 2:grep patterns(return all qualified words)
    var slashIndex = urlText.indexOf("/");
    var fileName = urlText, grepPattern = "", fileCommand = "", fileLines = 0, setLine = 0;
    if (slashIndex >= 0 ) {
      fileName = urlText.slice(0,slashIndex);
      fileCommand = urlText.slice(slashIndex+1);
      if (fileCommand[0] == "!"){
        wordsMode = 2; // GREP MODE
        grepPattern = fileCommand.slice(1);
      } else {
        wordsMode = 1; // Set Lines Mode
        setLine = parseInt(fileCommand);
      }
    }
    
    fileName += ".csv";

    var fileLinesExec = require("child_process").exec;
    var getFileLines = fileLinesExec('cat ./list/' + fileName + ' | wc -l',
      function (error, stdout, stderr){
        fileLines = parseInt(stdout)
        if (fileLines == 0) {
          finalOutput += ("File error on '" + fileName +"'.\n");
          response.end(finalOutput);
        } else {
          if (wordsMode == 0) randomNumber = Math.floor(Math.random()*fileLines) + 1; // from 1 to 'fileLines'
          if (wordsMode == 2) { //GREP MODE
            var getGrepExec = require("child_process").exec;
            var getGrep = getGrepExec('cat ./list/' + fileName +' | grep ' + grepPattern , 
              function (err, stout, sterr){
                //finalOutput += "GREP MODE : " + grepPattern + "\n";
                finalOutput += stout;
                response.end(finalOutput);
              }
            );
          } else { //Spec Line
            var numberLine;
            if (wordsMode == 0) numberLine = Math.floor(Math.random()*fileLines) + 1;
            else numberLine = setLine;
            //finalOutput += ("Word #" + numberLine + "\n");
            var getWordsExec = require('child_process').exec;
            var getWords = getWordsExec('cat ./list/' + fileName + " | awk 'NR==" + numberLine + "'",
              function (err,stout,sterr){
                finalOutput += stout;
                response.end(finalOutput);
              }
            );
          }
        }
      }
    );
  }
}

http.createServer(startServer).listen(serverPort);
console.log('nodeWordHime Server Started.');
console.log('Server running at http://127.0.0.1:'+serverPort+'/');
