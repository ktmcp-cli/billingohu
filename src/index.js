import { Command } from 'commander';
import chalk from 'chalk';
import ora from 'ora';
import { getConfig, setConfig, isConfigured } from './config.js';
import {
  listDocuments,
  getDocument,
  createDocument,
  downloadDocument,
  sendDocument,
  listPartners,
  getPartner,
  createPartner,
  updatePartner,
  deletePartner,
  listProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  listBankAccounts,
  getBankAccount,
  createBankAccount,
  updateBankAccount,
  deleteBankAccount,
  listDocumentBlocks,
  getDocumentBlock
} from './api.js';

const program = new Command();

// ============================================================
// Helpers
// ============================================================

function printSuccess(message) {
  console.log(chalk.green('✓') + ' ' + message);
}

function printError(message) {
  console.error(chalk.red('✗') + ' ' + message);
}

function printTable(data, columns) {
  if (!data || data.length === 0) {
    console.log(chalk.yellow('No results found.'));
    return;
  }

  const widths = {};
  columns.forEach(col => {
    widths[col.key] = col.label.length;
    data.forEach(row => {
      const val = String(col.format ? col.format(row[col.key], row) : (row[col.key] ?? ''));
      if (val.length > widths[col.key]) widths[col.key] = val.length;
    });
    widths[col.key] = Math.min(widths[col.key], 40);
  });

  const header = columns.map(col => col.label.padEnd(widths[col.key])).join('  ');
  console.log(chalk.bold(chalk.cyan(header)));
  console.log(chalk.dim('─'.repeat(header.length)));

  data.forEach(row => {
    const line = columns.map(col => {
      const val = String(col.format ? col.format(row[col.key], row) : (row[col.key] ?? ''));
      return val.substring(0, widths[col.key]).padEnd(widths[col.key]);
    }).join('  ');
    console.log(line);
  });

  console.log(chalk.dim(`\n${data.length} result(s)`));
}

function printJson(data) {
  console.log(JSON.stringify(data, null, 2));
}

async function withSpinner(message, fn) {
  const spinner = ora(message).start();
  try {
    const result = await fn();
    spinner.stop();
    return result;
  } catch (error) {
    spinner.stop();
    throw error;
  }
}

function requireAuth() {
  if (!isConfigured()) {
    printError('Billingo API key not configured.');
    console.log('\nRun the following to configure:');
    console.log(chalk.cyan('  billingohu config set --api-key <key>'));
    process.exit(1);
  }
}

// ============================================================
// Program metadata
// ============================================================

program
  .name('billingohu')
  .description(chalk.bold('Billingo CLI') + ' - Hungarian invoicing from your terminal')
  .version('1.0.0');

// ============================================================
// CONFIG
// ============================================================

const configCmd = program.command('config').description('Manage CLI configuration');

configCmd
  .command('set')
  .description('Set API key')
  .option('--api-key <key>', 'Billingo API key')
  .action((options) => {
    if (options.apiKey) {
      setConfig('apiKey', options.apiKey);
      printSuccess(`API key set`);
    } else {
      printError('No API key provided. Use --api-key <key>');
    }
  });

configCmd
  .command('show')
  .description('Show current configuration')
  .action(() => {
    const apiKey = getConfig('apiKey');
    console.log(chalk.bold('\nBillingo CLI Configuration\n'));
    console.log('API Key: ', apiKey ? chalk.green('*'.repeat(16)) : chalk.red('not set'));
    console.log('');
  });

// ============================================================
// DOCUMENTS (Invoices)
// ============================================================

const documentsCmd = program.command('documents').description('Manage documents (invoices)');

documentsCmd
  .command('list')
  .description('List documents')
  .option('--type <type>', 'Filter by type (invoice, receipt, proforma, etc.)')
  .option('--status <status>', 'Filter by status')
  .option('--page <n>', 'Page number', '1')
  .option('--per-page <n>', 'Results per page', '25')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const documents = await withSpinner('Fetching documents...', () =>
        listDocuments({ 
          page: parseInt(options.page), 
          perPage: parseInt(options.perPage),
          type: options.type,
          status: options.status
        })
      );

      if (options.json) {
        printJson(documents);
        return;
      }

      printTable(documents, [
        { key: 'id', label: 'ID' },
        { key: 'invoice_number', label: 'Number' },
        { key: 'type', label: 'Type' },
        { key: 'partner', label: 'Partner', format: (v) => v?.name || 'N/A' },
        { key: 'gross_total', label: 'Total' },
        { key: 'currency', label: 'Currency' },
        { key: 'fulfillment_date', label: 'Date' }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

documentsCmd
  .command('get <id>')
  .description('Get a specific document')
  .option('--json', 'Output as JSON')
  .action(async (id, options) => {
    requireAuth();
    try {
      const document = await withSpinner('Fetching document...', () => getDocument(id));

      if (!document) {
        printError('Document not found');
        process.exit(1);
      }

      if (options.json) {
        printJson(document);
        return;
      }

      console.log(chalk.bold('\nDocument Details\n'));
      console.log('ID:            ', chalk.cyan(document.id));
      console.log('Number:        ', document.invoice_number || 'N/A');
      console.log('Type:          ', document.type);
      console.log('Partner:       ', document.partner?.name || 'N/A');
      console.log('Currency:      ', document.currency);
      console.log('Net Total:     ', document.net_total);
      console.log('Gross Total:   ', chalk.bold(document.gross_total));
      console.log('Date:          ', document.fulfillment_date);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

documentsCmd
  .command('create')
  .description('Create a new document')
  .requiredOption('--data <json>', 'Document data as JSON')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    let documentData;
    try {
      documentData = JSON.parse(options.data);
    } catch {
      printError('Invalid JSON for --data');
      process.exit(1);
    }

    try {
      const document = await withSpinner('Creating document...', () =>
        createDocument(documentData)
      );

      if (options.json) {
        printJson(document);
        return;
      }

      printSuccess(`Document created: ${chalk.bold(document.id)}`);
      console.log('Number:  ', document.invoice_number || 'N/A');
      console.log('Total:   ', document.gross_total, document.currency);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

documentsCmd
  .command('download <id>')
  .description('Download document PDF')
  .action(async (id) => {
    requireAuth();
    try {
      const data = await withSpinner('Downloading document...', () => downloadDocument(id));
      printSuccess('Document downloaded (data returned)');
      printJson(data);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

documentsCmd
  .command('send <id>')
  .description('Send document via email')
  .requiredOption('--emails <emails>', 'Comma-separated email addresses')
  .action(async (id, options) => {
    requireAuth();
    const emails = options.emails.split(',').map(e => e.trim());
    try {
      await withSpinner('Sending document...', () => sendDocument(id, emails));
      printSuccess(`Document sent to: ${emails.join(', ')}`);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// PARTNERS (Clients)
// ============================================================

const partnersCmd = program.command('partners').description('Manage partners (clients)');

partnersCmd
  .command('list')
  .description('List partners')
  .option('--query <q>', 'Search query')
  .option('--page <n>', 'Page number', '1')
  .option('--per-page <n>', 'Results per page', '25')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const partners = await withSpinner('Fetching partners...', () =>
        listPartners({ 
          page: parseInt(options.page), 
          perPage: parseInt(options.perPage),
          query: options.query
        })
      );

      if (options.json) {
        printJson(partners);
        return;
      }

      printTable(partners, [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'email', label: 'Email' },
        { key: 'taxcode', label: 'Tax Code' },
        { key: 'iban', label: 'IBAN' }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

partnersCmd
  .command('get <id>')
  .description('Get a specific partner')
  .option('--json', 'Output as JSON')
  .action(async (id, options) => {
    requireAuth();
    try {
      const partner = await withSpinner('Fetching partner...', () => getPartner(id));

      if (!partner) {
        printError('Partner not found');
        process.exit(1);
      }

      if (options.json) {
        printJson(partner);
        return;
      }

      console.log(chalk.bold('\nPartner Details\n'));
      console.log('ID:       ', chalk.cyan(partner.id));
      console.log('Name:     ', chalk.bold(partner.name));
      console.log('Email:    ', partner.email || 'N/A');
      console.log('Tax Code: ', partner.taxcode || 'N/A');
      console.log('IBAN:     ', partner.iban || 'N/A');
      console.log('Address:  ', partner.address?.address || 'N/A');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

partnersCmd
  .command('create')
  .description('Create a new partner')
  .requiredOption('--data <json>', 'Partner data as JSON')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    let partnerData;
    try {
      partnerData = JSON.parse(options.data);
    } catch {
      printError('Invalid JSON for --data');
      process.exit(1);
    }

    try {
      const partner = await withSpinner('Creating partner...', () =>
        createPartner(partnerData)
      );

      if (options.json) {
        printJson(partner);
        return;
      }

      printSuccess(`Partner created: ${chalk.bold(partner.name)}`);
      console.log('ID: ', partner.id);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

partnersCmd
  .command('update <id>')
  .description('Update a partner')
  .requiredOption('--data <json>', 'Partner data as JSON')
  .option('--json', 'Output as JSON')
  .action(async (id, options) => {
    requireAuth();
    let partnerData;
    try {
      partnerData = JSON.parse(options.data);
    } catch {
      printError('Invalid JSON for --data');
      process.exit(1);
    }

    try {
      const partner = await withSpinner('Updating partner...', () =>
        updatePartner(id, partnerData)
      );

      if (options.json) {
        printJson(partner);
        return;
      }

      printSuccess(`Partner updated: ${chalk.bold(partner.name)}`);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

partnersCmd
  .command('delete <id>')
  .description('Delete a partner')
  .action(async (id) => {
    requireAuth();
    try {
      await withSpinner('Deleting partner...', () => deletePartner(id));
      printSuccess('Partner deleted');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// PRODUCTS
// ============================================================

const productsCmd = program.command('products').description('Manage products');

productsCmd
  .command('list')
  .description('List products')
  .option('--page <n>', 'Page number', '1')
  .option('--per-page <n>', 'Results per page', '25')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const products = await withSpinner('Fetching products...', () =>
        listProducts({ page: parseInt(options.page), perPage: parseInt(options.perPage) })
      );

      if (options.json) {
        printJson(products);
        return;
      }

      printTable(products, [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'net_unit_price', label: 'Net Price' },
        { key: 'gross_unit_price', label: 'Gross Price' },
        { key: 'currency', label: 'Currency' },
        { key: 'vat', label: 'VAT' }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

productsCmd
  .command('get <id>')
  .description('Get a specific product')
  .option('--json', 'Output as JSON')
  .action(async (id, options) => {
    requireAuth();
    try {
      const product = await withSpinner('Fetching product...', () => getProduct(id));

      if (!product) {
        printError('Product not found');
        process.exit(1);
      }

      if (options.json) {
        printJson(product);
        return;
      }

      console.log(chalk.bold('\nProduct Details\n'));
      console.log('ID:          ', chalk.cyan(product.id));
      console.log('Name:        ', chalk.bold(product.name));
      console.log('Net Price:   ', product.net_unit_price);
      console.log('Gross Price: ', product.gross_unit_price);
      console.log('Currency:    ', product.currency);
      console.log('VAT:         ', product.vat);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

productsCmd
  .command('create')
  .description('Create a new product')
  .requiredOption('--data <json>', 'Product data as JSON')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    let productData;
    try {
      productData = JSON.parse(options.data);
    } catch {
      printError('Invalid JSON for --data');
      process.exit(1);
    }

    try {
      const product = await withSpinner('Creating product...', () =>
        createProduct(productData)
      );

      if (options.json) {
        printJson(product);
        return;
      }

      printSuccess(`Product created: ${chalk.bold(product.name)}`);
      console.log('ID: ', product.id);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

productsCmd
  .command('update <id>')
  .description('Update a product')
  .requiredOption('--data <json>', 'Product data as JSON')
  .option('--json', 'Output as JSON')
  .action(async (id, options) => {
    requireAuth();
    let productData;
    try {
      productData = JSON.parse(options.data);
    } catch {
      printError('Invalid JSON for --data');
      process.exit(1);
    }

    try {
      const product = await withSpinner('Updating product...', () =>
        updateProduct(id, productData)
      );

      if (options.json) {
        printJson(product);
        return;
      }

      printSuccess(`Product updated: ${chalk.bold(product.name)}`);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

productsCmd
  .command('delete <id>')
  .description('Delete a product')
  .action(async (id) => {
    requireAuth();
    try {
      await withSpinner('Deleting product...', () => deleteProduct(id));
      printSuccess('Product deleted');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// BANK ACCOUNTS
// ============================================================

const bankAccountsCmd = program.command('bank-accounts').description('Manage bank accounts');

bankAccountsCmd
  .command('list')
  .description('List bank accounts')
  .option('--page <n>', 'Page number', '1')
  .option('--per-page <n>', 'Results per page', '25')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const accounts = await withSpinner('Fetching bank accounts...', () =>
        listBankAccounts({ page: parseInt(options.page), perPage: parseInt(options.perPage) })
      );

      if (options.json) {
        printJson(accounts);
        return;
      }

      printTable(accounts, [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'account_number', label: 'Account Number' },
        { key: 'iban', label: 'IBAN' },
        { key: 'swift', label: 'SWIFT' },
        { key: 'currency', label: 'Currency' }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

bankAccountsCmd
  .command('get <id>')
  .description('Get a specific bank account')
  .option('--json', 'Output as JSON')
  .action(async (id, options) => {
    requireAuth();
    try {
      const account = await withSpinner('Fetching bank account...', () => getBankAccount(id));

      if (!account) {
        printError('Bank account not found');
        process.exit(1);
      }

      if (options.json) {
        printJson(account);
        return;
      }

      console.log(chalk.bold('\nBank Account Details\n'));
      console.log('ID:             ', chalk.cyan(account.id));
      console.log('Name:           ', chalk.bold(account.name));
      console.log('Account Number: ', account.account_number);
      console.log('IBAN:           ', account.iban);
      console.log('SWIFT:          ', account.swift);
      console.log('Currency:       ', account.currency);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

bankAccountsCmd
  .command('create')
  .description('Create a new bank account')
  .requiredOption('--data <json>', 'Bank account data as JSON')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    let accountData;
    try {
      accountData = JSON.parse(options.data);
    } catch {
      printError('Invalid JSON for --data');
      process.exit(1);
    }

    try {
      const account = await withSpinner('Creating bank account...', () =>
        createBankAccount(accountData)
      );

      if (options.json) {
        printJson(account);
        return;
      }

      printSuccess(`Bank account created: ${chalk.bold(account.name)}`);
      console.log('ID: ', account.id);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

bankAccountsCmd
  .command('update <id>')
  .description('Update a bank account')
  .requiredOption('--data <json>', 'Bank account data as JSON')
  .option('--json', 'Output as JSON')
  .action(async (id, options) => {
    requireAuth();
    let accountData;
    try {
      accountData = JSON.parse(options.data);
    } catch {
      printError('Invalid JSON for --data');
      process.exit(1);
    }

    try {
      const account = await withSpinner('Updating bank account...', () =>
        updateBankAccount(id, accountData)
      );

      if (options.json) {
        printJson(account);
        return;
      }

      printSuccess(`Bank account updated: ${chalk.bold(account.name)}`);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

bankAccountsCmd
  .command('delete <id>')
  .description('Delete a bank account')
  .action(async (id) => {
    requireAuth();
    try {
      await withSpinner('Deleting bank account...', () => deleteBankAccount(id));
      printSuccess('Bank account deleted');
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// DOCUMENT BLOCKS (Invoice pads)
// ============================================================

const blocksCmd = program.command('document-blocks').description('Manage document blocks (invoice pads)');

blocksCmd
  .command('list')
  .description('List document blocks')
  .option('--page <n>', 'Page number', '1')
  .option('--per-page <n>', 'Results per page', '25')
  .option('--json', 'Output as JSON')
  .action(async (options) => {
    requireAuth();
    try {
      const blocks = await withSpinner('Fetching document blocks...', () =>
        listDocumentBlocks({ page: parseInt(options.page), perPage: parseInt(options.perPage) })
      );

      if (options.json) {
        printJson(blocks);
        return;
      }

      printTable(blocks, [
        { key: 'id', label: 'ID' },
        { key: 'name', label: 'Name' },
        { key: 'prefix', label: 'Prefix' },
        { key: 'type', label: 'Type' }
      ]);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

blocksCmd
  .command('get <id>')
  .description('Get a specific document block')
  .option('--json', 'Output as JSON')
  .action(async (id, options) => {
    requireAuth();
    try {
      const block = await withSpinner('Fetching document block...', () => getDocumentBlock(id));

      if (!block) {
        printError('Document block not found');
        process.exit(1);
      }

      if (options.json) {
        printJson(block);
        return;
      }

      console.log(chalk.bold('\nDocument Block Details\n'));
      console.log('ID:     ', chalk.cyan(block.id));
      console.log('Name:   ', chalk.bold(block.name));
      console.log('Prefix: ', block.prefix);
      console.log('Type:   ', block.type);
    } catch (error) {
      printError(error.message);
      process.exit(1);
    }
  });

// ============================================================
// Parse
// ============================================================

program.parse(process.argv);

if (process.argv.length <= 2) {
  program.help();
}
