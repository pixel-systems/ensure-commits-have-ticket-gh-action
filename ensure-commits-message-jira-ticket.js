const git = require("./git.js");
const logger = require("./logging.js");
const inputParser = require("./input-param-parse.js");
const reverse = (str) => str.split("").reverse().join("");

logger.logTitle("ENSURING JIRA TICKETS INTO COMMIT MESSAGES");

const baseBranch = process.argv[2];
const prBranch = process.argv[3];
const ignorePrFromBranches = process.argv[4];

logger.logKeyValuePair("base-branch", baseBranch);
logger.logKeyValuePair("pr-branch", prBranch);
logger.logKeyValuePair("ignore-pr-from-branches", ignorePrFromBranches);

if (ignorePrFromBranches) {  

  let fromBranchesArray = inputParser.parseStringArray(ignorePrFromBranches,'[a-zA-Z0-9]{3,}','ignore-pr-from-branches')
  
  const prBranchMatchAnyIgnoreFromBranch = fromBranchesArray.filter(fb => prBranch.match(fb))

  if (prBranchMatchAnyIgnoreFromBranch.length > 0) {
    logger.logWarning("Ignoring ensure jira tickets into commit messages, ignore-pr-from-branches matches: " + prBranchMatchAnyIgnoreFromBranch)
    process.exit(0)
  }
}

let ok = git
  .getCommitsInsidePullRequest(baseBranch, `origin/${prBranch}`)
  .every((commit) => {
    logger.logTitle("EVALUATING COMMIT");

    if (commit.subject.includes('[skip ci]')) {
      logger.logWarning(`skipping commit validation because contains [skip ci].`)
      logger.logKeyValuePair("commit", commit.subject);
      return true
    }

    let commitMessage = `${commit.subject} ${commit.body}`;
    const reversedTickets = reverse(commitMessage).match(
      /\d+-[A-Z]+(?!-?[a-zA-Z]{1,10})/g
    );
    let commitMessageOk = reversedTickets != null && reversedTickets.length > 0;
    let result = {
      message: commitMessageOk ? "OK" : "WRONG",
      documentation:
        "https://stackoverflow.com/questions/19322669/regular-expression-for-a-jira-identifier",
      guidelines: [
        "Official JIRA Regex ONLY supports capital letters for ticket codes",
      ],
      examples: [
        "feat: GMP-323 awesome new feature",
        "break: removing GET /ping endpoint (LANZ-3456)",
        "feat (app1): awesome new feature in the app1",
        "[skip ci] doing some ci magic"
      ],
    };

    logger.logKeyValuePair("commit", commit.subject);

    if (!commitMessageOk) {
      logger.logError(`no ticket provided for the commit`)
    } else {
      logger.logSucceed(`the commit has a ticket`)
    }
    logger.logKeyValuePair("result", result);
    return commitMessageOk;
  });

if (!ok) {
  process.exit(1);
}
