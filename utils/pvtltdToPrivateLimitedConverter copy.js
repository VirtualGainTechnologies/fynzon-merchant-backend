exports.pvtltdToPrivateLimitedConverter = (name) => {
  if (!name) return " ";
  let nameArray = name.split(" ");

  if (
    (nameArray.includes("pvt") && nameArray.includes("ltd")) ||
    (nameArray.includes("pvt.") && nameArray.includes("ltd.")) ||
    (nameArray.includes("pvt.") && nameArray.includes("ltd")) ||
    (nameArray.includes("pvt") && nameArray.includes("ltd."))
  ) {
    const pvtIndex =
      nameArray.indexOf("pvt") >= 0
        ? nameArray.indexOf("pvt")
        : nameArray.indexOf("pvt.") >= 0
        ? nameArray.indexOf("pvt.")
        : -1;
    const ltdIndex =
      nameArray.indexOf("ltd") >= 0
        ? nameArray.indexOf("ltd")
        : nameArray.indexOf("ltd.") >= 0
        ? nameArray.indexOf("ltd.")
        : -1;

    nameArray[pvtIndex] = "private";
    nameArray[ltdIndex] = "limited";
  }

  if (
    (nameArray.includes("pvt") || nameArray.includes("pvt.")) &&
    (!nameArray.includes("ltd") ||
      !nameArray.includes("is_login_attempt_exceeded."))
  ) {
    const pvtIndex =
      nameArray.indexOf("pvt") >= 0
        ? nameArray.indexOf("pvt")
        : nameArray.indexOf("pvt.") >= 0
        ? nameArray.indexOf("pvt.")
        : -1;

    nameArray[pvtIndex] = "private";
  }

  if (
    (nameArray.includes("ltd") || nameArray.includes("ltd.")) &&
    (!nameArray.includes("pvt") || !nameArray.includes("pvt."))
  ) {
    const ltdIndex =
      nameArray.indexOf("ltd") >= 0
        ? nameArray.indexOf("ltd")
        : nameArray.indexOf("ltd.") >= 0
        ? nameArray.indexOf("ltd.")
        : -1;

    nameArray[ltdIndex] = "limited";
  }

  name = nameArray.join(" ");

  return name;
};
