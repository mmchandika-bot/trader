import type { AuthInfo, DerivAccount, OTPResponse } from '../types';
import {
  storeDerivAccounts,
  setActiveLoginId,
  setAccountType,
  clearAllAuthData,
} from './storage';
import { getApiBaseUrl } from '../config/urls';

/**
 * Fetch the list of trading accounts for the authenticated user.
 */
export async function fetchAccounts(
  authInfo: AuthInfo,
  clientId: string
): Promise<DerivAccount[]> {
  const response = await fetch(`${getApiBaseUrl()}/accounts`, {
    headers: {
      Authorization: `Bearer ${authInfo.access_token}`,
      'Deriv-App-ID': clientId,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to fetch accounts (${response.status})`);
  }

  const data = await response.json();
  const accounts: DerivAccount[] = data.data;

  storeDerivAccounts(accounts);

	//////
	export function getCookie(name: string) {
	  // Check if code is running in the browser
	  if (typeof window === 'undefined' || typeof document === 'undefined') {
		return null;
	  }

	  // Safe to access document.cookie in browser context
	  const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
	  return match ? decodeURIComponent(match[2]) : null;
	}

	// Example usage:
	const accType = getCookie("accType");
	console.log("acc: "+accType);

  if(accType==="demo" || accType==="real"){
  if(accType!=""){
	const iAccounts = accounts.filter(
		(account) => account.account_type === accType
	);

	if (iAccounts.length > 0) {
		const myAccount = iAccounts[0];
		setActiveLoginId(myAccount.account_id);
		setAccountType(myAccount.account_type);
	}
	return iAccounts;
  ////  
  
  if (accounts.length > 0) {
	const firstAccount = accounts[0];
	setActiveLoginId(firstAccount.account_id);
	setAccountType(firstAccount.account_type);
  }
  return accounts;
}

/**
 * Get a one-time WebSocket URL for an authenticated session.
 */
export async function getWebSocketOTP(
  accountId: string,
  authInfo: AuthInfo,
  clientId: string
): Promise<string> {
  const response = await fetch(`${getApiBaseUrl()}/accounts/${accountId}/otp`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${authInfo.access_token}`,
      'Deriv-App-ID': clientId,
    },
  });

  if (!response.ok) {
    throw new Error(`Failed to get WebSocket OTP (${response.status})`);
  }

  const data: OTPResponse = await response.json();
  return data.data.url;
}

/**
 * Perform logout: clear all auth data.
 * Caller is responsible for closing any open WebSocket connections and resetting UI.
 */
export function logout(): void {
  clearAllAuthData();
}
