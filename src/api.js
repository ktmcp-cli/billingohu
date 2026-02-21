import axios from 'axios';
import { getConfig } from './config.js';

function getBaseURL() {
  const configuredUrl = getConfig('baseUrl');
  return configuredUrl || 'https://api.billingo.hu/v3';
}

function getHeaders() {
  const headers = {
    'Content-Type': 'application/json'
  };

  const apiKey = getConfig('apiKey');
  if (apiKey) {
    headers['Authorization'] = `Bearer ${apiKey}`;
  }

  return headers;
}

async function request(endpoint, method = 'GET', data = null) {
  const baseURL = getBaseURL();
  try {
    const config = {
      method,
      url: `${baseURL}${endpoint}`,
      headers: getHeaders()
    };

    if (data) {
      config.data = data;
    }

    const response = await axios(config);
    return response.data;
  } catch (error) {
    if (error.response?.data) {
      throw new Error(`API Error: ${JSON.stringify(error.response.data)}`);
    }
    throw new Error(`Request failed: ${error.message}`);
  }
}

// ============================================================
// API Methods
// ============================================================

/**
 * List all bank account
 */
export async function listBankAccount(params = {}) {
  const endpoint = '/bank-accounts';
  return await request(endpoint, 'GET', params);
}

/**
 * Create a bank account
 */
export async function createBankAccount(params = {}) {
  const endpoint = '/bank-accounts';
  return await request(endpoint, 'POST', params);
}

/**
 * Delete a bank account
 */
export async function deleteBankAccount(params = {}) {
  const endpoint = '/bank-accounts/{id}';
  return await request(endpoint, 'DELETE', params);
}

/**
 * Retrieve a bank account
 */
export async function getBankAccount(params = {}) {
  const endpoint = '/bank-accounts/{id}';
  return await request(endpoint, 'GET', params);
}

/**
 * Update a bank account
 */
export async function updateBankAccount(params = {}) {
  const endpoint = '/bank-accounts/{id}';
  return await request(endpoint, 'PUT', params);
}

/**
 * Get currencies exchange rate.
 */
export async function getConversionRate(params = {}) {
  const endpoint = '/currencies';
  return await request(endpoint, 'GET', params);
}

/**
 * List all document blocks
 */
export async function listDocumentBlock(params = {}) {
  const endpoint = '/document-blocks';
  return await request(endpoint, 'GET', params);
}

/**
 * List all documents
 */
export async function listDocument(params = {}) {
  const endpoint = '/documents';
  return await request(endpoint, 'GET', params);
}

/**
 * Create a document
 */
export async function createDocument(params = {}) {
  const endpoint = '/documents';
  return await request(endpoint, 'POST', params);
}

/**
 * Retrieve a document
 */
export async function getDocument(params = {}) {
  const endpoint = '/documents/{id}';
  return await request(endpoint, 'GET', params);
}

