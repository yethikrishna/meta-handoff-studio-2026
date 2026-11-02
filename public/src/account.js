// Public preview intentionally has no sign-in or email-delivery controls.
// The API/backend auth code is not enabled in this demo deployment.
const status = document.querySelector("#account-status");
if (status) status.textContent = "Sign-in is disabled in this public preview. No email will be requested or sent. Synthetic demo fixtures remain available.";
