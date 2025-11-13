exports.calculateAge = (date) => {
  const formattedDate = date.split("/"); //for date format dd/mm/yyyy
  const dateTimeStamp = new Date(
    formattedDate[2],
    formattedDate[1],
    formattedDate[0]
  );
  const currentDate = new Date().getTime();
  const difference = currentDate - dateTimeStamp;
  const currentAge = Math.floor(difference / 31557600000);
  // dividing by 1000*60*60*24*365.25
  return currentAge;
};

exports.checkExpiry = (date) => {
  const dateArray = date.split("/"); //for date format dd/mm/yyyy
  const formattedDate = `${dateArray[2]}/${dateArray[1]}/${dateArray[0]}`;
  const dateTimeStamp = new Date(formattedDate);
  const currentDate = new Date();

  if (currentDate > dateTimeStamp) {
    return {
      isExpired: true,
    };
  } else {
    return {
      isExpired: false,
    };
  }
};

exports.getFormattedDate = (epochMilliseconds) => {
  const timestamp = new Date(epochMilliseconds).getTime();
  const dateObj = new Date(timestamp);

  const day = String(dateObj.getDate()).padStart(2, "0");
  const month = String(dateObj.getMonth() + 1).padStart(2, "0");
  const year = dateObj.getFullYear();

  const DDMMYYYYYDate = `${day}/${month}/${year}`;
  const YYYYMMDDDate = `${year}-${month}-${day}`;

  return {
    DDMMYYYYYDate,
    YYYYMMDDDate,
  };
};

//  Formats a given timestamp into Indian Standard Time (IST) date and
exports.formatDateToIST = (timestamp) => {
  const date = new Date(timestamp);

  // Options for date formatting for individual components
  const weekdayOptions = { weekday: "short", timeZone: "Asia/Kolkata" };
  const dayOptions = { day: "numeric", timeZone: "Asia/Kolkata" };
  const monthOptions = { month: "short", timeZone: "Asia/Kolkata" };
  const yearOptions = { year: "numeric", timeZone: "Asia/Kolkata" };

  // Get individual components
  const weekday = date.toLocaleDateString("en-IN", weekdayOptions);
  const day = date.toLocaleDateString("en-IN", dayOptions);
  const month = date.toLocaleDateString("en-IN", monthOptions);
  const year = date.toLocaleDateString("en-IN", yearOptions);

  // Manually construct the date string to control the comma placement
  const formattedISTDate = `${weekday}, ${day} ${month} ${year}`;

  // Options for time formatting (remains unchanged as it was already correct)
  const timeOptions = {
    hour: "2-digit", // Example: 05
    minute: "2-digit", // Example: 15
    hour12: true, // Use AM/PM
    timeZone: "Asia/Kolkata", // IST timezone
  };

  const formattedTime = date.toLocaleTimeString("en-IN", timeOptions);

  return { formattedISTDate, formattedTime };
};
