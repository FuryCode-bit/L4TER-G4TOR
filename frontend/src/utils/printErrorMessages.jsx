const printErrorMessage = (error) => {
  let errorMessage = 'An unexpected error occurred.';
  if (error.response) {
      errorMessage = `Request failed with status code ${error.response.status} - ${error.response.data.error || ""}`;
      alert(errorMessage);
  } else {
      alert(errorMessage);
  }
};

export default printErrorMessage;