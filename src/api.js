import axios from 'axios';
import { getConfig } from './config.js';

const BILLINGO_BASE_URL = 'https://api.billingo.hu/v3';

/**
 * Make an authenticated API request
 */
async function apiRequest(method, endpoint, data = null, params = null) {
  const apiKey = getConfig('apiKey');

  if (!apiKey) {
    throw new Error('API key not configured. Please run: billingohu config set --api-key <key>');
  }

  const config = {
    method,
    url: `${BILLINGO_BASE_URL}${endpoint}`,
    headers: {
      'X-API-KEY': apiKey,
      'Accept': 'application/json',
      'Content-Type': 'application/json'
    }
  };

  if (params) config.params = params;
  if (data) config.data = data;

  try {
    const response = await axios(config);
    return response.data;
  } catch (error) {
    handleApiError(error);
  }
}

function handleApiError(error) {
  if (error.response) {
    const status = error.response.status;
    const data = error.response.data;

    if (status === 401) {
      throw new Error('Authentication failed. Check your API key.');
    } else if (status === 403) {
      throw new Error('Access forbidden. Check your API permissions.');
    } else if (status === 404) {
      throw new Error('Resource not found.');
    } else if (status === 429) {
      throw new Error('Rate limit exceeded. Please wait before retrying.');
    } else {
      const message = data?.message || JSON.stringify(data);
      throw new Error(`API Error (${status}): ${message}`);
    }
  } else if (error.request) {
    throw new Error('No response from Billingo API. Check your internet connection.');
  } else {
    throw error;
  }
}

// ============================================================
// DOCUMENTS (Invoices)
// ============================================================

export async function listDocuments({ page = 1, perPage = 25, type, status } = {}) {
  const params = { page, per_page: perPage };
  if (type) params.type = type;
  if (status) params.status = status;

  const data = await apiRequest('GET', '/documents', null, params);
  return data.data || [];
}

export async function getDocument(documentId) {
  const data = await apiRequest('GET', `/documents/${documentId}`);
  return data.data || null;
}

export async function createDocument(documentData) {
  const data = await apiRequest('POST', '/documents', documentData);
  return data.data || null;
}

export async function downloadDocument(documentId) {
  const data = await apiRequest('GET', `/documents/${documentId}/download`);
  return data;
}

export async function sendDocument(documentId, emails) {
  const data = await apiRequest('POST', `/documents/${documentId}/send`, { emails });
  return data;
}

// ============================================================
// PARTNERS (Clients)
// ============================================================

export async function listPartners({ page = 1, perPage = 25, query } = {}) {
  const params = { page, per_page: perPage };
  if (query) params.query = query;

  const data = await apiRequest('GET', '/partners', null, params);
  return data.data || [];
}

export async function getPartner(partnerId) {
  const data = await apiRequest('GET', `/partners/${partnerId}`);
  return data.data || null;
}

export async function createPartner(partnerData) {
  const data = await apiRequest('POST', '/partners', partnerData);
  return data.data || null;
}

export async function updatePartner(partnerId, partnerData) {
  const data = await apiRequest('PUT', `/partners/${partnerId}`, partnerData);
  return data.data || null;
}

export async function deletePartner(partnerId) {
  await apiRequest('DELETE', `/partners/${partnerId}`);
  return true;
}

// ============================================================
// PRODUCTS
// ============================================================

export async function listProducts({ page = 1, perPage = 25 } = {}) {
  const params = { page, per_page: perPage };
  const data = await apiRequest('GET', '/products', null, params);
  return data.data || [];
}

export async function getProduct(productId) {
  const data = await apiRequest('GET', `/products/${productId}`);
  return data.data || null;
}

export async function createProduct(productData) {
  const data = await apiRequest('POST', '/products', productData);
  return data.data || null;
}

export async function updateProduct(productId, productData) {
  const data = await apiRequest('PUT', `/products/${productId}`, productData);
  return data.data || null;
}

export async function deleteProduct(productId) {
  await apiRequest('DELETE', `/products/${productId}`);
  return true;
}

// ============================================================
// BANK ACCOUNTS
// ============================================================

export async function listBankAccounts({ page = 1, perPage = 25 } = {}) {
  const params = { page, per_page: perPage };
  const data = await apiRequest('GET', '/bank-accounts', null, params);
  return data.data || [];
}

export async function getBankAccount(accountId) {
  const data = await apiRequest('GET', `/bank-accounts/${accountId}`);
  return data.data || null;
}

export async function createBankAccount(accountData) {
  const data = await apiRequest('POST', '/bank-accounts', accountData);
  return data.data || null;
}

export async function updateBankAccount(accountId, accountData) {
  const data = await apiRequest('PUT', `/bank-accounts/${accountId}`, accountData);
  return data.data || null;
}

export async function deleteBankAccount(accountId) {
  await apiRequest('DELETE', `/bank-accounts/${accountId}`);
  return true;
}

// ============================================================
// DOCUMENT BLOCKS (Invoice pads)
// ============================================================

export async function listDocumentBlocks({ page = 1, perPage = 25 } = {}) {
  const params = { page, per_page: perPage };
  const data = await apiRequest('GET', '/document-blocks', null, params);
  return data.data || [];
}

export async function getDocumentBlock(blockId) {
  const data = await apiRequest('GET', `/document-blocks/${blockId}`);
  return data.data || null;
}
