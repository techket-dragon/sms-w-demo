// aws
import aws, { SNS } from 'aws-sdk';

// xlsx
import XLSX from 'xlsx';

// env
import * as dotenv from 'dotenv';
import path from 'path';
dotenv.config();

// load demo member name & mobile number
import { demoMemberMobile } from './data/member-mobile';

// score calcuation
import { calcAbsent, calcLate, calcLightStatus, calcPresent } from './calculation';

// Dragon's advice: change data structure
// load current member name & mobile number
// import { memberMobile } from './data/member-mobile';

// config AWS SNS
// use AWS SNS for sms service
export const sns = new aws.SNS({
  accessKeyId: process.env.AWS_SNS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SNS_SECRET_ACCESS_KEY,
  region: process.env.AWS_REGION,
  endpoint: `http://sns.${process.env.AWS_REGION}.amazonaws.com`
});

// read member info & scores from input xlsx file
function readExcel() {
  const rootDir = process.cwd();
  const targetXlsxPath = '/data/input.xlsx';
  
  const wbInput = XLSX.readFile(path.join(rootDir, targetXlsxPath));
  const wsReport = wbInput.Sheets['Report'];

  const list = XLSX.utils.sheet_to_json(wsReport);  

  return list
}


function main() {
  const memberRecordList = readExcel();

  // push all member name from member mobile phone into a list
  const memberNameList: string[] = [];
  for (let member in demoMemberMobile) {
    memberNameList.push(member);
  }

  // uncomment to debug
  // console.debug(`memberNameList is:`);
  // console.debug(memberNameList);

  // demo purpose only
  // assume xlsx row 1 is Dragon Lung, row 2 is William Kong
  // Dragon's advice: change data structure
  for (let i=0; i<memberNameList.length; i++) {
    const memberName = memberNameList[i];
    // typed as any for a quick demo
    const memberScoreJson: any = memberRecordList[i+1];
    
    // demo on present
    const timesPresent = memberScoreJson['P'];
    const scorePresent = calcPresent(timesPresent);
    // end of demo on present

    const timesAbsent = memberScoreJson['A'];
    const timesLate = memberScoreJson['L'];

    const scoreAbsent = calcAbsent(timesAbsent);
    const scoreLate = calcLate(timesLate);

    // todo
    // member week & end of month are not in demo
    // because join_dates.xlsx is not available

    // todo
    // referral score depends on join date & not available
    // const scoreReferral = calcReferral(memberScoreJson['RGI'], memberScoreJson['RGO']);

    // todo
    // visitor score is not in demo
    // because join_dates.xlsx is not available

    // todo
    // all other scores depends on join_dates.xlsx & are not available

    const scoreTotal = scorePresent + scoreAbsent + scoreLate;

    const lightStatus = calcLightStatus(scoreTotal);

    // todo
    // separate smsMessage & send sns from main
const smsMessage = `\
[demo]\n\
${memberName}: Your score is ${scoreTotal}(${lightStatus} light)\n\
In the past meetings, you have been present on-time for ${timesPresent}, late for ${timesLate} and absent for ${timesAbsent}\n\
You have a total referral of ${scoreTotal}.\n\
Keep going!\n\
\n\
- Demo by Dragon\
`;

    var params: SNS.Types.PublishInput = {
      Message: smsMessage,
      MessageStructure: 'string',
      PhoneNumber: demoMemberMobile[memberName],
    };

    sns.publish(params, function(err, data) {
      if (err) console.log(err, err.stack); // an error occurred
      else     {};                          // successful response, do not do anything
    });
  }

}

main();
