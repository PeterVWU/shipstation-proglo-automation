// ==UserScript==
// @name         Shipstation proglo automation
// @namespace    http://tampermonkey.net/
// @version      2024-06-28
// @description  try to take over the world!
// @author       You
// @match        https://progloshipping.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @updateURL    https://raw.githubusercontent.com/PeterVWU/shipstation-proglo-automation/main/main.js
// @downloadURL  https://raw.githubusercontent.com/PeterVWU/shipstation-proglo-automation/main/main.js
// @grant        GM_addStyle
// @grant        GM_setValue
// @grant        GM_getValue
// @grant        GM_setClipboard
// ==/UserScript==

(function() {
    'use strict';

    const shipstationProxy = "https://shipstation-proxy.info-ba2.workers.dev"

    // Create a container for the input and button
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.top = '0';
    container.style.left = '0';
    container.style.width = '100%';
    container.style.backgroundColor = 'white';
    container.style.zIndex = '9999';
    container.style.padding = '10px';
    container.style.boxShadow = '0 2px 5px rgba(0,0,0,0.2)';
    container.style.display = 'flex';
    container.style.alignItems = 'center';
    container.style.justifyContent= "right";
    container.style.gap= "10px";

    // Create an input field for the order number
    const input = document.createElement('input');
    input.type = 'text';
    input.placeholder = 'Enter Order Number';
    input.style.marginRight = '10px';
    input.style.padding = '5px';
    input.style.fontSize = '14px';
    input.style.border = '1px solid #ccc';
    input.style.borderRadius = '4px';
    input.style.color = 'black';

    // Create a button to fetch the order
    const button = document.createElement('button');
    button.textContent = 'Get Order';
    button.style.padding = '5px 10px';
    button.style.fontSize = '14px';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.backgroundColor = '#007BFF';
    button.style.color = 'white';
    button.style.cursor = 'pointer';

    // Create a status message
    const status = document.createElement('span');
    status.style.fontSize = '14px';
    status.style.color = 'black';

    // Create an input field for the order number
    const trackingInput  = document.createElement('input');
    trackingInput.type = 'text';
    trackingInput.placeholder = 'Enter Tracking Number';
    trackingInput.style.padding = '5px';
    trackingInput.style.fontSize = '14px';
    trackingInput.style.border = '1px solid #ccc';
    trackingInput.style.borderRadius = '4px';
    trackingInput.style.color = 'black';

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close Order';
    closeButton.style.padding = '5px 10px';
    closeButton.style.fontSize = '14px';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '4px';
    closeButton.style.backgroundColor = '#007BFF';
    closeButton.style.color = 'white';
    closeButton.style.cursor = 'pointer';

    // Add input, button, and status to the container
    container.appendChild(status);
    container.appendChild(input);
    container.appendChild(button);
    container.appendChild(trackingInput);
    container.appendChild(closeButton);
    document.body.appendChild(container);


// Function to fetch order data
    function fetchOrder(orderNumber) {
        status.textContent = 'Loading...';

        fetch(`${shipstationProxy}/orders?orderNumber=${orderNumber}`, {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json'
            }
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            if (data.orders && data.orders.length > 0) {
                const firstOrder = data.orders[0];
                console.log(firstOrder);
                // Store the order details in local storage
                // localStorage.setItem('orderDetails', JSON.stringify(firstOrder));
                GM_setValue('orderDetails', firstOrder);
                status.textContent = 'Order fetched successfully!';
                if (window.location.pathname === '/user/create-labels') {
                    fillFormWithOrderDetails(firstOrder);
                } else {
                    // Navigate to the /user/create-labels page
                    window.location.href = 'https://progloshipping.com/user/create-labels';
                }
            } else {
                status.textContent = 'No orders found.';
            }
        })
        .catch(error => {
            console.error('Error fetching order:', error);
            status.textContent = 'Error fetching order.';
        });
    }

    // Function to fill the form with order details
    function fillFormWithOrderDetails(orderDetails) {
        console.log("fillFormWithOrderDetails")
        // Fill "mail from" form with dummy data
        document.getElementById('FromName').value = 'John Doe';
        document.getElementById('FromStreet').value = '123 Main St';
        document.getElementById('FromCity').value = 'Anytown';
        document.getElementById('FromState').value = 'CA';
        document.getElementById('FromZip').value = '12345';
        document.getElementById('FromCountry').value = 'USA';

        // Fill "mail to" form with order data
        document.getElementById('ToName').value = orderDetails.shipTo.name;
        document.getElementById('ToStreet').value = orderDetails.shipTo.street1;
        document.getElementById('ToStreet2').value = orderDetails.shipTo.street2;
        document.getElementById('ToCity').value = orderDetails.shipTo.city;
        document.getElementById('ToState').value = orderDetails.shipTo.state;
        document.getElementById('ToZip').value = orderDetails.shipTo.postalCode;
        document.getElementById('ToCountry').value = orderDetails.shipTo.country;

        // Scroll to the bottom of the page
        window.scrollTo(0, document.body.scrollHeight);
    }

     // Function to find the order in the dashboard table
     function findOrderInDashboard() {
        console.log('findOrderInDashboard')
        const orderDetails = GM_getValue('orderDetails', {});
        if (orderDetails) {
            const orderNumber = orderDetails.orderNumber;
            // const orderNumber = '3430'; // test code 
            const rows = document.querySelectorAll('table tr');
            for (let row of rows) {
                const firstColumn = row.querySelector('td');
                if (firstColumn && firstColumn.textContent.trim() === orderNumber) {
                    row.style.backgroundColor = '#0d33bf'; // Highlight the row
                    console.log('found row', row)
                    break;
                }
            }
        }
    }

    // Function to close the order with the tracking number
    function closeOrderWithTrackingNumber(trackingNumber) {
        const cleanedTrackingNumber = trackingNumber.replace(/\s+/g, '');
        const orderDetails = GM_getValue('orderDetails', {});
        fetch(`${shipstationProxy}/orders/markasshipped`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                orderId: orderDetails.orderId,
                trackingNumber: cleanedTrackingNumber
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(data => {
            console.log('Order closed successfully:', data);
            input.value = '';
            GM_setValue('orderDetails',{});
            const status = document.querySelector('#status');
            status.textContent = 'Order processed successfully!';
        })
        .catch(error => {
            console.error('Error closing order:', error);
            const status = document.querySelector('#status');
            status.textContent = 'Error processing order.';
        });
    }

    // Add event listener to the button
    button.addEventListener('click', () => {
        const orderNumber = input.value.trim();
        if (orderNumber) {
            fetchOrder(orderNumber);
        } else {
            status.textContent = 'Please enter an order number.';
        }
    });
    closeButton.addEventListener('click', () => {
        const trackingNumber = trackingInput.value.trim();
        if (trackingNumber) {
            closeOrderWithTrackingNumber(trackingNumber);
        } else {
            alert('Please enter a tracking number.');
        }
    });
    async function init() {
        // Check if we are on the /user/create-labels page
        if (window.location.href.includes('/user/create-labels')) {
            const orderDetails = GM_getValue('orderDetails', {});
            console.log('orderDetails',orderDetails)
            if (orderDetails) {
                await new Promise(resolve => setTimeout(resolve, 1000));
                fillFormWithOrderDetails(orderDetails);
            }
        }else if (window.location.pathname === '/user/dashboard') {
            await new Promise(resolve => setTimeout(resolve, 1000));
            findOrderInDashboard();
        }
    }
    init()
})();