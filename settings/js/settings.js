var devicesList = []
var HomeyObj

function onHomeyReady (Homey) {
  HomeyObj = Homey
  initSettings()
  HomeyObj.ready()
}

function initSettings () {
  clearBusy()
  clearError()
  clearSuccess()
  loadSettings()

  $('#newDeviceAddForm').submit(function() {
    var ip = $('#add-ip').val()
    
    if (devicesList.some(item => item.ip === ip)) {
      showError(__('settings.messages.ipDuplicateError'), 3000);
      return false
    }
    adddevice()
  });

  $('#donateButtonYandex').submit(function() {
    var url = 'https://money.yandex.ru/to/410013864894090/'
    HomeyObj.popup(url, { width: 500, height: 900 });
  });
}

function adddevice () {
  var ip = $('#add-ip').val()
  var token = $('#add-token').val()
  var name = $('#add-name').val()

  if (devicesList.some(item => item.ip === ip)) {
    showError(__('settings.messages.ipDuplicateError'), 3000);
    return false
  }

  $('#add-ip').val('')
  $('#add-token').val('')
  $('#add-name').val('')
  var newDevice = {id: ip+token, name: name, ip: ip, token: token }
  devicesList.push(newDevice)
  devicesList.forEach(adddevicesToList)
  savedevicesList()
  showSuccess(__('settings.messages.savingSuccess'), 1500)

}


function adddevicesToList (device) {
  const listItem = createListItem(device);
  const ipList = document.getElementById('ip-list');
  ipList.appendChild(listItem);
}

function createListItem (device) {
  const nameLabel = createElement('label', { className: 'name' }, device.name);
  const nameEditInput = createElement('input', { id: 'nameInput', type: 'text', className: 'nameInput' });
  const ipLabel = createElement('label', { className: 'ip' }, device.ip);
  const ipEditInput = createElement('input', { id: 'ipInput', type: 'text', className: 'ipInput' });
  const tokenLabel = createElement('label', { className: 'token' }, device.token);
  const tokenEditInput = createElement('input', { id: 'tokenInput', type: 'text', className: 'tokenInput', 'name': 'tokenInput' });
  const editButton = createElement('button', { id: 'add-button', className: 'edit', 'data-i18n': 'settings.list.editOnList' }, 'EDIT');
  const deleteButton = createElement('button', { id: 'add-button', className: 'remove', 'data-i18n': 'settings.list.removeFromList' }, 'REMOVE');
  const item = createElement('li', { className: `deviceList`, 'data-id': device.id }, nameLabel, nameEditInput, ipLabel, ipEditInput, tokenLabel, tokenEditInput, editButton, deleteButton);

  return addEventListeners(item);
}

function createElement(tag, props, ...children) {
    const element = document.createElement(tag);

    Object.keys(props).forEach(key => {
        if (key.startsWith('data-')) {
            element.setAttribute(key, props[key]);
        } else if (key.startsWith('id')) {
            element.setAttribute(key, props[key]);
        } else if (key.startsWith('onkeyup')) {
            element.setAttribute(key, props[key]);
        } else if (key.startsWith('name')) {
            element.setAttribute(key, props[key]);
        } else {
            element[key] = props[key];
        }
    });

    children.forEach(child => {
        if (typeof child === 'string') {
            child = document.createTextNode(child);
        }

        element.appendChild(child);
    });

    return element;
}

function addEventListeners(item) {
  const editButton = item.querySelector('button.edit');
  const removeButton = item.querySelector('button.remove');

  editButton.addEventListener('click', handleEdit);
  removeButton.addEventListener('click', handleRemove);

  return item;
}

function handleEdit({ target }) {
  const listItem = target.parentNode;
  const id = listItem.getAttribute('data-id');
  const deviceName = listItem.querySelector('.name')
  const deviceIp = listItem.querySelector('.ip');
  const deviceToken = listItem.querySelector('.token');
  const nameInput = listItem.querySelector('.nameInput');
  const ipInput = listItem.querySelector('.ipInput');
  const tokenInput = listItem.querySelector('.tokenInput')
  const editButton = listItem.querySelector('button.edit');
  const name = nameInput.value;
  const ip = ipInput.value;
  const token = tokenInput.value
  const isEditing = listItem.classList.contains('editing');

  if (isEditing) {
      const changes = { id: id, name: name, ip: ip, token: token };
      if ($( "#tokenInput.shake" ).hasClass( "tokenInput" ) || $( "#ipInput.shake" ).hasClass( "ipInput" )) {
        
      } else {
        editTodo(changes);
      }
      
  } else {
      nameInput.value = deviceName.textContent;
      ipInput.value = deviceIp.textContent;
      tokenInput.value = deviceToken.textContent;
      editButton.textContent = 'SAVE';
      listItem.classList.add('editing');
  }
}

function editTodo({ id, name, ip, token }) {
  const data = {
    name: name,
    ip: ip,
    token: token
  }
  const item = updateItem(id, data);
  editItem(item);
}

function updateItem(id, data) {
  const item = getItem(id);

  Object.keys(data).forEach(prop => item[prop] = data[prop]);
  savedevicesList()

  return item;
}

function getItem(id) {
  return devicesList.find(item => item.id == id);
}

function editItem(device) {
  const listItem = findListItem(device.id);
  const name = listItem.querySelector('.name');
  const nameInput = listItem.querySelector('.nameInput');
  const ip = listItem.querySelector('.ip');
  const ipInput = listItem.querySelector('.ipInput');
  const token = listItem.querySelector('.token');
  const tokenInput = listItem.querySelector('.tokenInput');
  const editButton = listItem.querySelector('button.edit');

  name.textContent = device.name;
  ip.textContent = device.ip;
  token.textContent = device.token
  editButton.textContent = 'EDIT';
  listItem.classList.remove('editing');
}

function handleRemove({ target }) {
  const listItem = target.parentNode;

  removeItem(listItem.getAttribute('data-id'));

  var data = devicesList;
  var index = -1;
  var val = target
  var filteredObj = data.find(function(item, i){
    if(item.ip === val){
      index = i;
      return i;
    }
  });

  $(`[data-ip="${target}"]`).remove()
  devicesList.splice(index, 1)

  savedevicesList()
}

function removeItem(id) {
  const listItem = findListItem(id);
  const ipList = document.getElementById('ip-list');

  ipList.removeChild(listItem);
}

function findListItem(id) {
  const ipList = document.getElementById('ip-list');
  return ipList.querySelector(`[data-id="${id}"]`);
}


function loadSettings () {
  HomeyObj.get('devicesList', function (error, currentdevicesList) {
    if (error) return console.error(error)
    devicesList = currentdevicesList || []
    devicesList.forEach(adddevicesToList)
  })
}

function savedevicesList () {
  HomeyObj.set('devicesList', devicesList, function (error, settings) {
    if (error) { return showError(__('settings.messages.savingError')) }
    showSuccess(__('settings.messages.savingSuccess'), 3000)
  })
}

function clearBusy () { $('#busy').hide() }
function showBusy (message, showTime) {
  clearError()
  clearSuccess()
  var element = document.getElementById("header");
  element.style.backgroundColor = "#f2ff00aa";
  var title = document.getElementsByClassName("h1")
  const oldTitle = title[0].innerHTML
  title[0].innerHTML = message;
  setTimeout(function(){
    element.style.backgroundColor = "#d5e4ff";
    title[0].innerHTML = oldTitle;
  }, showTime);
}

function clearError () { $('#error').hide() }
function showError (message, showTime) {
  clearBusy()
  clearSuccess()
  var element = document.getElementById("header");
  element.style.backgroundColor = "#ff0000aa";
  var title = document.getElementsByClassName("h1")
  const oldTitle = title[0].innerHTML
  title[0].innerHTML = message;
  setTimeout(function(){
    element.style.backgroundColor = "#d5e4ff";
    title[0].innerHTML = oldTitle;
  }, showTime);
}

function clearSuccess () { $('#success').hide() }
function showSuccess (message, showTime) {
  clearBusy()
  clearError()
  var element = document.getElementById("header");
  element.style.backgroundColor = "#00ff00aa";
  var title = document.getElementsByClassName("h1")
  const oldTitle = title[0].innerHTML
  title[0].innerHTML = message;
  setTimeout(function(){
    element.style.backgroundColor = "#d5e4ff";
    title[0].innerHTML = oldTitle;
  }, showTime);
}
