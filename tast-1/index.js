const express = require('express');
const app = express();
const axios = require('axios');
const mysql = require('mysql2');

// Create a connection to the MySQL database
const connection = mysql.createConnection({
  host: '127.0.0.1',
  user: 'root',
  password: 'root123@A',
  database: 'contacts'
});

// Connect to the database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to the database: ' + err.stack);
    return;
  }
  console.log('Connected to the database.');
});

// Use the express.json middleware to parse the request body as JSON
app.use(express.json());

// Define the endpoint to create a new contact
app.post('/createContact', (req, res) => {
  // Get the parameters from the request body
  const { first_name, last_name, email, mobile_number, data_store } = req.body;

  // Validate the parameters
  if (!first_name || !last_name || !email || !mobile_number || !data_store) {
    return res.status(400).json({ message: 'Missing parameters' });
  }

  // Check the data_store value
  if (data_store === 'CRM') {
    // Create a contact in the CRM using the FreshSales API
    // Set the API key and domain
    const api_key = 'TroKfQPZgVQ-Ibq_D0PQ6A';
    const domain = 'atom-648460690219012305.myfreshworks.com/crm/sales';

    // Set the headers for the request
    const headers = {
      accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Token token=' + api_key
    };

    // Set the data for the request
    const data = {
      contact: {
        first_name: first_name,
        last_name: last_name,
        email: email,
        mobile_number: mobile_number
      }
    };

    // Make a POST request to the FreshSales API
    if (!domain) {
      console.error('Domain is not defined');
    } else {
    axios
      .post(`https://${domain}/api/contacts`, data, { headers: headers })
      .then((response) => {
        // Handle the response
        console.log('Contact created in the CRM successfully.');
        console.log(response.data);
        // Send a success response to the client
        res.status(201).json({ message: 'Contact created in the CRM successfully.', data: response.data });
      })
      .catch((error) => {
        // Handle the error
        console.error('Error creating contact in the CRM: ' + error.message);
        // Send an error response to the client
        res.status(500).json({ message: 'Error creating contact in the CRM: ' + error.message });
      });
  }} else if (data_store === 'DATABASE') {
    // Create a contact in the database using the MySQL module
    // Set the query to insert a new row in the contacts table
    const query = 'INSERT INTO contacts (first_name, last_name, email, mobile_number) VALUES (?, ?, ?, ?)';

    // Set the values for the query
    const values = [first_name, last_name, email, mobile_number];

    // Execute the query
    connection.query(query, values, (err, result) => {
      if (err) {
        // Handle the error
        console.error('Error creating contact in the database: ' + err.message);
        // Send an error response to the client
        res.status(500).json({ message: 'Error creating contact in the database: ' + err.message });
      } else {
        // Handle the result
        console.log('Contact created in the database successfully.');
        console.log(result);
        // Send a success response to the client
        res.status(201).json({ message: 'Contact created in the database successfully.', data: result });
      }
    });
  } else {
    // Invalid data_store value
    return res.status(400).json({ message: 'Invalid data_store value' });
  }
});

// Define the endpoint to get a contact by id
app.post('/getContact', (req, res) => {
  // Get the parameters from the request body
  const { contact_id, data_store } = req.body;

  // Validate the parameters
  if (!contact_id || !data_store) {
    return res.status(400).json({ message: 'Missing parameters' });
  }

  // Check the data_store value
  if (data_store === 'CRM') {
    // Get a contact from the CRM using the FreshSales API
    // Set the API key and domain
    const api_key = 'TroKfQPZgVQ-Ibq_D0PQ6A';
    const domain = 'atom-648460690219012305.myfreshworks.com/crm/sales';

    // Set the headers for the request
    const headers = {
      accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Token token=' + api_key
    };

    // Make a GET request to the FreshSales API
    axios
      .get(`https://${domain}/api/contacts/${contact_id}`, { headers: headers })
      .then((response) => {
        // Handle the response
        console.log('Contact retrieved from the CRM successfully.');
        console.log(response.data);
        // Send a success response to the client
        res.status(200).json({ message: 'Contact retrieved from the CRM successfully.', data: response.data });
      })
      .catch((error) => {
        // Handle the error
        console.error('Error retrieving contact from the CRM: ' + error.message);
        // Send an error response to the client
        res.status(500).json({ message: 'Error retrieving contact from the CRM: ' + error.message });
      });
  } else if (data_store === 'DATABASE') {
    // Get a contact from the database using the MySQL module
    // Set the query to select a row from the contacts table by id
    const query = 'SELECT * FROM contacts WHERE id = ?';

    // Set the value for the query
    const value = [contact_id];

    // Execute the query
    connection.query(query, value, (err, result) => {
      if (err) {
        // Handle the error
        console.error('Error retrieving contact from the database: ' + err.message);
        // Send an error response to the client
        res.status(500).json({ message: 'Error retrieving contact from the database: ' + err.message });
      } else {
        // Handle the result
        console.log('Contact retrieved from the database successfully.');
        console.log(result);
        // Check if the result is empty
        if (result.length === 0) {
          // No contact found with the given id
          console.error('Contact id not found in the database.');
          // Send a not found response to the client
          res.status(404).json({ message: 'Contact id not found in the database.' });
        } else {
          // Contact found with the given id
          // Send a success response to the client
          res.status(200).json({ message: 'Contact retrieved from the database successfully.', data: result });
        }
      }
    });
  } else {
    // Invalid data_store value
    return res.status(400).json({ message: 'Invalid data_store value' });
  }
});



// Define the endpoint to update a contact by id
app.post('/updateContact', (req, res) => {
  // Get the parameters from the request body
  const { contact_id, new_email, new_mobile_number, data_store } = req.body;

  // Validate the parameters
  if (!contact_id || !new_email || !new_mobile_number || !data_store) {
    return res.status(400).json({ message: 'Missing parameters' });
  }

  // Check the data_store value
  if (data_store === 'CRM') {
    // Update a contact in the CRM using the FreshSales API
    // Set the API key and domain
    const api_key = 'TroKfQPZgVQ-Ibq_D0PQ6A';
    const domain = 'atom-648460690219012305.myfreshworks.com/crm/sales';

    // Set the headers for the request
    const headers = {
      accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Token token=' + api_key
    };

    // Set the data for the request
    const data = {
      contact: {
        email: new_email,
        mobile_number: new_mobile_number
      }
    };

    // Make a PUT request to the FreshSales API
    axios
      .put(`https://${domain}/api/contacts/${contact_id}`, data, { headers: headers })
      .then((response) => {
        // Handle the response
        console.log('Contact updated in the CRM successfully.');
        console.log(response.data);
        // Send a success response to the client
        res.status(200).json({ message: 'Contact updated in the CRM successfully.', data: response.data });
      })
      .catch((error) => {
        // Handle the error
        console.error('Error updating contact in the CRM: ' + error.message);
        // Send an error response to the client
        res.status(500).json({ message: 'Error updating contact in the CRM: ' + error.message });
      });
  } else if (data_store === 'DATABASE') {
    // Update a contact in the database using the MySQL module
    // Set the query to update a row in the contacts table by id
    const query = 'UPDATE contacts SET email = ?, mobile_number = ? WHERE id = ?';

    // Set the values for the query
    const values = [new_email, new_mobile_number, contact_id];

    // Execute the query
    connection.query(query, values, (err, result) => {
      if (err) {
        // Handle the error
        console.error('Error updating contact in the database: ' + err.message);
        // Send an error response to the client
        res.status(500).json({ message: 'Error updating contact in the database: ' + err.message });
      } else {
        // Handle the result
        console.log('Contact updated in the database successfully.');
        console.log(result);
        // Send a success response to the client
        res.status(200).json({ message: 'Contact updated in the database successfully.', data: result });
      }
    });
  } else {
    // Invalid data_store value
    return res.status(400).json({ message: 'Invalid data_store value' });
  }
});



// Define the endpoint to delete a contact by id
app.post('/deleteContact', (req, res) => {
  // Get the parameters from the request body
  const { contact_id, data_store } = req.body;

  // Validate the parameters
  if (!contact_id || !data_store) {
    return res.status(400).json({ message: 'Missing parameters' });
  }

  // Check the data_store value
  if (data_store === 'CRM') {
    // Delete a contact from the CRM using the FreshSales API
    // Set the API key and domain
    const api_key = 'TroKfQPZgVQ-Ibq_D0PQ6A';
    const domain = 'atom-648460690219012305.myfreshworks.com/crm/sales';

    // Set the headers for the request
    const headers = {
      accept: 'application/json',
      'Content-Type': 'application/json',
      Authorization: 'Token token=' + api_key
    };

    // Make a DELETE request to the FreshSales API
    axios
      .delete(`https://${domain}/api/contacts/${contact_id}`, { headers: headers })
      .then((response) => {
        // Handle the response
        console.log('Contact deleted from the CRM successfully.');
        console.log(response.data);
        // Send a success response to the client
        res.status(200).json({ message: 'Contact deleted from the CRM successfully.', data: response.data });
      })
      .catch((error) => {
        // Handle the error
        console.error('Error deleting contact from the CRM: ' + error.message);
        // Send an error response to the client
        res.status(500).json({ message: 'Error deleting contact from the CRM: ' + error.message });
      });
  } else if (data_store === 'DATABASE') {
    // Delete a contact from the database using the MySQL module
    // Set the query to delete a row from the contacts table by id
    const query = 'DELETE FROM contacts WHERE id = ?';

    // Set the value for the query
    const value = [contact_id];

    // Execute the query
    connection.query(query, value, (err, result) => {
      if (err) {
        // Handle the error
        console.error('Error deleting contact from the database: ' + err.message);
        // Send an error response to the client
        res.status(500).json({ message: 'Error deleting contact from the database: ' + err.message });
      } else {
        // Handle the result
        console.log('Contact deleted from the database successfully.');
        console.log(result);
        // Send a success response to the client
        res.status(200).json({ message: 'Contact deleted from the database successfully.', data: result });
      }
    });
  } else {
    // Invalid data_store value
    return res.status(400).json({ message: 'Invalid data_store value' });
  }
});

// Start the server on port 3000
app.listen(3000, () => {
  console.log('Server listening on port 3000');
});