/**
Hoodie chunk left so that we can see how hoodie operates

// initialize Hoodie
var hoodie  = new Hoodie()

// initial load of all todo items from the store
hoodie.store.findAll('todo').then( function(todos) {
  todos.sort( sortByCreatedAt ).forEach( addTodo )
})

// when a new todo gets stored, add it to the UI
hoodie.store.on('add:todo', addTodo)
// clear todo list when the get wiped from store
hoodie.account.on('signout', clearTodos)

// handle creating a new task
$('#todoinput').on('keypress', function(event) {
  if (event.keyCode == 13) { // ENTER
    hoodie.store.add('todo', {title: event.target.value});
    event.target.value = '';
  }
})

function addTodo( todo ) { 
  $('#todolist').append('<li>'+todo.title+'</li>');
}
function clearTodos() {
  $('#todolist').html('');
}
function sortByCreatedAt(a, b) { 
  return a.createdAt > b.createdAt
}
**/

// begin ZUE UI code here

$('#link-button').on('click', function() {
    if ( bridge !== undefined ) {
        if ( ! linking ) {
            linking = true;
            $(this).val('cancel');
            createUser();
        }
        else {
            linking = false;
            $(this).val('link');
        }
    }
    else {
        alert('no bridge found');
    }
})
.hide();

var bridge;
var linking = false;
var app = 'california';

var createUser = function() {
    zue.config.createUser(bridge, 'web application', app);
}

// RK: function copies light into DOM for future use, any resource that returns a Light
//     should probably call this function.
function saveLight(light) {
    $('#lights').find('li[light-id=' + light.id + ']').data('light', light).find('span').text(light.name + light.state.hue);
}

// RK: function gets the light out of DOM for any given element by looking up to it's 
//     closest parent that would have a light. Convenient for triggers nested underneath
//     a DOM object encapsulating a light.
function getLight(element) {
    return $(element).closest('li[light-id]').data('light');
}

// RK: Enable the name-based group simulator
zue.enablePlugin('SimulateGroupsByNames');

zue.on(HUE_ERROR, function(err) {
    if ( err.type == ERR_UNAUTHORIZED ) {
        $('#link-button').show();
    }
    else {
        $('#hue-exception').modal();
    }
});

zue.on(BRIDGE_FOUND, function(_bridge) {
    bridge = _bridge;
    bridge.hue_username = app;
    zue.lights.getAllLights(bridge);
});

zue.on(LIGHT_ADDED, function(light) {
    if ( $('#lights').find('li[light-id=' + light.id + ']').length < 1 ) {
        $lightLI = $('<li/>')
            .attr('light-id', light.id)
            .html( '<span>' + light.name + '</span><a>ON</a>')
            .data('light', light)
            .find('a')
                .on('click', function() {
                    getLight(this).setHue(parseInt(prompt('hue'),10));
                })
            .end();
        $('#lights').append($lightLI);
        $lightLI = '';
        if ( light.simple ) {
            zue.lights.getLightDetails(light);
        }
    }
    else {
        saveLight(light);
    }
});

zue.on(LIGHT_UPDATING, function(light) {
    $('#lights').find('li[light-id=' + light.id + ']').addClass('updating');
});

zue.on(LIGHT_UPDATED, function(light) {
    $('#lights').find('li[light-id=' + light.id + ']').removeClass('updating');
    saveLight(light);
});

//zue.addPlugin(new GroupNameImplementation());
zue.on(GROUP_ADDED, function(group) {
    $('#lights').append($('<li/>').text('GROUP: ' + group.name));
});


zue.on(LINK_FAILURE, function(user) {
    console.log(JSON.stringify(user));
    if ( linking ) {
        setTimeout(createUser, 5000);
    }
});

zue.on(LINK_SUCCESS, function(user) {
    alert(user.username);
});
zue.bridge.locate();
