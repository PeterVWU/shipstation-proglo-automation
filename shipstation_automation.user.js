// ==UserScript==
// @name         Shipstation proglo automation
// @namespace    http://tampermonkey.net/
// @version      1.0.15
// @description  Automate shipstation Proglo workflow
// @author       Peter Chen
// @match        https://progloshipping.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @updateURL    https://raw.githubusercontent.com/PeterVWU/shipstation-proglo-automation/main/shipstation_automation.user.js
// @downloadURL  https://raw.githubusercontent.com/PeterVWU/shipstation-proglo-automation/main/shipstation_automation.user.js
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
    input.style.padding = '5px';
    input.style.fontSize = '20px';
    input.style.border = '1px solid #ccc';
    input.style.borderRadius = '4px';
    input.style.color = 'black';

    // Create a button to fetch the order
    const button = document.createElement('button');
    button.textContent = 'Get Order';
    button.style.padding = '5px 10px';
    button.style.fontSize = '20px';
    button.style.border = 'none';
    button.style.borderRadius = '4px';
    button.style.backgroundColor = '#007BFF';
    button.style.color = 'white';
    button.style.cursor = 'pointer';

    // Create a current order number display
    const currentOrder = document.createElement('span');
    currentOrder.style.fontSize = '20px';
    currentOrder.style.color = 'blue';

    // Create a status message
    const status = document.createElement('span');
    status.style.fontSize = '20px';
    status.style.color = 'black';

    // Create an input field for the order number
    const trackingInput  = document.createElement('input');
    trackingInput.type = 'text';
    trackingInput.placeholder = 'Enter Tracking Number';
    trackingInput.style.padding = '5px';
    trackingInput.style.fontSize = '20px';
    trackingInput.style.border = '1px solid #ccc';
    trackingInput.style.borderRadius = '4px';
    trackingInput.style.color = 'black';

    const closeButton = document.createElement('button');
    closeButton.textContent = 'Close Order';
    closeButton.style.padding = '5px 10px';
    closeButton.style.fontSize = '20px';
    closeButton.style.border = 'none';
    closeButton.style.borderRadius = '4px';
    closeButton.style.backgroundColor = '#007BFF';
    closeButton.style.color = 'white';
    closeButton.style.cursor = 'pointer';

    // Add input, button, and status to the container
    container.appendChild(currentOrder);
    container.appendChild(status);
    container.appendChild(input);
    container.appendChild(button);
    container.appendChild(trackingInput);
    container.appendChild(closeButton);
    document.body.appendChild(container);


// Function to fetch order data
    async function fetchOrder(orderNumber) {
        status.textContent = 'Loading...';

        await fetch(`${shipstationProxy}/orders?orderNumber=${orderNumber}`, {
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
                GM_setValue('orderDetails', firstOrder);
                status.textContent = 'Order fetched successfully!';
                if(firstOrder.orderStatus === 'shipped') {
                    currentOrder.textContent = `Order#: ${firstOrder.orderNumber} shipped`;
                    currentOrder.style.color = 'red';
                    return;
                } else {
                    currentOrder.textContent = `Order#: ${firstOrder.orderNumber}`;
                    currentOrder.style.color = 'blue';
                }
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
        function setNativeValue(elementid, value) {
            const element = document.getElementById(elementid);
            const valueSetter = Object.getOwnPropertyDescriptor(element, 'value').set;
            const prototype = Object.getPrototypeOf(element);
            const prototypeValueSetter = Object.getOwnPropertyDescriptor(prototype, 'value').set;
          
            if (valueSetter && valueSetter !== prototypeValueSetter) {
              prototypeValueSetter.call(element, value);
            } else {
              valueSetter.call(element, value);
            }
            element.dispatchEvent(new Event('input', { bubbles: true }));
          }

          function setSelectValue(id, value) {
            const select = document.getElementById(id);
            if (select) {
                for (const option of select.options) {
                    if (option.value === value) {
                        select.value = value;
                        select.dispatchEvent(new Event('change', { bubbles: true }));
                        break;
                    }
                }
            }
        }
        console.log("fillFormWithOrderDetails")
        setNativeValue('FromName',`Return Address ${orderDetails.orderNumber}`)
        setNativeValue('FromCompany','VWU LLC')
        setNativeValue('FromStreet','3395 S Jones Blvd PMB #180')
        setNativeValue('FromCity','Las Vegas')
        setSelectValue('FromState','NV')
        setNativeValue('FromZip','89146')
        setNativeValue('FromCountry','USA')
        setNativeValue('FromPhone','8005008486')
        // Fill "mail from" form with dummy data

        // Fill "mail to" form with order data
        setNativeValue('ToName',orderDetails.shipTo.name)
        if(orderDetails.shipTo.company){
            setNativeValue('ToCompany',orderDetails.shipTo.company)
        }
        setNativeValue('ToStreet',orderDetails.shipTo.street1)
        setNativeValue('ToStreet2',orderDetails.shipTo.street2)
        setNativeValue('ToCity',orderDetails.shipTo.city)
        setSelectValue('ToState',orderDetails.shipTo.state)
        setNativeValue('ToZip',orderDetails.shipTo.postalCode)
        setNativeValue('ToCountry',orderDetails.shipTo.country)
        setNativeValue('ToPhone',orderDetails.shipTo.phone)

        // Scroll to the bottom of the page
        window.scrollTo(0, document.body.scrollHeight);
    }

     // Function to find the order in the dashboard table
     function findOrderInDashboard() {
        console.log('findOrderInDashboard')
        const orderDetails = GM_getValue('orderDetails', {});
        if (orderDetails) {
            const orderNumber = orderDetails.orderNumber;
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
    async function closeOrderWithTrackingNumber(trackingNumber) {
        status.textContent = 'Loading...';
        const cleanedTrackingNumber = trackingNumber.replace(/\s+/g, '');
        const orderDetails = GM_getValue('orderDetails', {});
        await fetch(`${shipstationProxy}/orders/markasshipped`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                orderId: orderDetails.orderId,
                carrierCode: "usps",
                trackingNumber: cleanedTrackingNumber,
                notifyCustomer: true,
                notifySalesChannel: true
            })
        })
        .then(response => {
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            return response.json();
        })
        .then(async data => {
            await recordClosedOrder(orderDetails)
            console.log('Order closed successfully:', data);
            input.value = '';
            trackingInput.value = '';
            GM_setValue('orderDetails',{});
            status.textContent = 'Order processed successfully!';
            currentOrder.textContent = `Order#: N/A`;
        })
        .catch(error => {
            console.error('Error closing order:', error);
            status.textContent = 'Error processing order.';
        });
    }

    // Function to record closed orders with timestamps
    async function recordClosedOrder(orderData) {
        const orderNumber = orderData.orderNumber;
        const timestamp = new Date().toISOString();
        const scriptURL = 'https://googlesheet-record-close-order.info-ba2.workers.dev/';

        await fetch(scriptURL, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ orderNumber, timestamp }),
        })
        .then(response => response.json())
        .then(data => {
            console.log('Order recorded successfully:', data);
        })
        .catch(error => {
            console.error('Error recording order:', error);
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
    input.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const orderNumber = input.value.trim();
            if (orderNumber) {
                fetchOrder(orderNumber);
            } else {
                status.textContent = 'Please enter an order number.';
            }
        }
    });

    closeButton.addEventListener('click', () => {
        const trackingNumber = trackingInput.value.trim();
        if (trackingNumber) {
            closeOrderWithTrackingNumber(trackingNumber);
        } else {
            status.textContent = 'Please enter a tracking number.';
        }
    });

    trackingInput.addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            const trackingNumber = trackingInput.value.trim();
            if (trackingNumber) {
                closeOrderWithTrackingNumber(trackingNumber);
            } else {
                status.textContent = 'Please enter a tracking number.';
            }
        }
    });

    async function init() {
        const orderDetails = GM_getValue('orderDetails', {});
        if(orderDetails){
            currentOrder.textContent = `Order#: ${orderDetails.orderNumber}`;
        }
        // Check if we are on the /user/create-labels page
        if (window.location.href.includes('/user/create-labels')) {
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