let baseUrl         = "http://localhost:8000/";
let baseSocketUrl   = "ws://localhost:8000/";

export let authRegisterUrl  : string = baseUrl + "api/auth/register/";
export let authLoginUrl     : string = baseUrl + "api/auth/login/";
export let authLogoutUrl    : string = baseUrl + "api/auth/logout/";
export let authForgotPassUrl: string = baseUrl + "api/auth/forgot_password/";
export let authResetPassUrl : string = baseUrl + "api/auth/reset_password/";
export let authChangePassUrl: string = baseUrl + "api/auth/change_password/";
export let confirmEmailUrl  : string = baseUrl + "api/auth/confirm/";
export let profileSetupUrl  : string = baseUrl + "api/auth/profile-setup/";
export let tokenRefreshUrl  : string = baseUrl + "api/auth/refresh-token/";
export let dataUrl          : string = baseUrl + "api/data/";
export let updateDataUrl    : string = baseUrl + "api/update-data";
export let productsUrl      : string = baseUrl + "api/products";
