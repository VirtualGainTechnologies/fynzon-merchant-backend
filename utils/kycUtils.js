exports.getPanStatusByStatusCode = (statusCode = "") => {
  let message = "";

  switch (statusCode) {
    case "E":
      message = "PAN Status : Valid";
      break;
    case "F":
      message = "PAN Status : Fake";
      break;
    case "X":
      message = "PAN Status : Deactivated";
      break;
    case "D":
      message = "PAN Status : Deleted";
      break;
    case "N":
      message = "PAN Status : Invalid";
      break;
    case "EA":
      message = "PAN Status : Amalgamation";
      break;
    case "EC":
      message = "PAN Status : Acquisition";
      break;
    case "ED":
      message = "PAN Status : Death";
      break;
    case "EI":
      message = "PAN Status : Dissolution";
      break;
    case "EL":
      message = "PAN Status : Liquidated";
      break;
    case "EM":
      message = "PAN Status : Merger";
      break;
    case "EP":
      message = "PAN Status : Partition";
      break;
    case "ES":
      message = "PAN Status : Split";
      break;
    case "EU":
      message = "PAN Status : Under Liquidation";
      break;
    default:
      message = "";
  }

  return message;
};

exports.getAadharPanLinkStatus = (statusCode = "") => {
  let message = "";

  switch (statusCode) {
    case "Y":
      message = "PAN and Aadhaar is linked";
      break;
    case "R":
      message = "PAN and Aadhaar is not linked";
      break;
    case "Blank":
      message = "Invalid PAN, hence Aadhaar is not seeded";
      break;
    case "NA":
      message = "PAN is non-individual. Hence seeding not applicable";
      break;
    default:
      message = "";
  }

  return message;
};
