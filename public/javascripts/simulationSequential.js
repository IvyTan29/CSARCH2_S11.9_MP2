let keyInput = {
    block: $('#blockSize'),
    set: $('#setSize'),
    cache: $('#cacheSize'),
    cacheTime: $('#cacheTime'),
    memory: $('#memorySize'),
    memoryTime: $('#memoryTime')
};
let keyTasks;

// For adding additional tasks
$('#addTaskButton').on("click", function() {
    let currentNumberOfTasks = $('.task-group').length;
    let nextTaskNumber = currentNumberOfTasks + 1;

    let taskGroup =
        `<div class="task-group">
            <h5>Task ${nextTaskNumber}</h5>
            <div class="row">
              <div class="form-group col-lg-4 col-md-sm-12">
                  <label for="lowerRange-${nextTaskNumber}">From</label>
                  <input type="number" class="form-control form-control-sm lower-range" id="lowerRange-${nextTaskNumber}">
                  <small id="lowerError-${nextTaskNumber}" class="text-danger input-error"></small>
              </div>

              <div class="form-group col-lg-4 col-md-sm-12">
                  <label for="upperRange-${nextTaskNumber}">To</label>
                  <input type="number" class="form-control form-control-sm upper-range" id="upperRange-${nextTaskNumber}">
                  <small id="upperError-${nextTaskNumber}" class="text-danger input-error"></small>
              </div>

              <div class="form-group col-lg-4 col-md-sm-12">
                  <label for="loopCount-${nextTaskNumber}">Loop count</label>
                  <input type="number" class="form-control form-control-sm loop-count" id="loopCount-${nextTaskNumber}" placeholder="Number of times to repeat task"">
                  <small id="loopError-${nextTaskNumber}" class="text-danger input-error"></small>
              </div>
            </div>
         </div>`;

    $('#taskList').append(taskGroup);
});

// For removing task (removes the last task on the taskList)
$('#removeTaskButton').on("click", function() {
    let currentNumberOfTasks = $('.task-group').length;

    if (currentNumberOfTasks > 1) {
        $('.task-group').last().remove();
    }
});

// AJAX post
$('#simulateButton').on("click", function() {

    // Get all inputs
    // A Task object has attributes: lowerRange, upperRange, loopCount
    let tasks = getArrayOfTasks();
    let inputType = $('#inputType').val().trim();
    let blockSize = $('#blockSize').val().trim();
    let setSize = $('#setSize').val().trim();
    let cacheSize = $('#cacheSize').val().trim();
    let cacheAccessTime = $('#cacheTime').val().trim();
    let memorySize = $('#memorySize').val().trim();
    let memoryAccessTime = $('#memoryTime').val().trim();
    let cacheSizeDropdown = $('#cacheSizeDropdown').val().trim();
    let memorySizeDropdown = $('#memorySizeDropdown').val().trim();

    // error checking for missing inputs, power of 2, is a positive integer
    let valid = true;

    if (!blockSize) {
        valid = false;
        setError('block', 'Missing input');
    } else if (!isStringInteger(blockSize) || !(parseInt(blockSize) > 0)) {
        valid = false;
        setError('block', 'Not a positive integer');
    } else if (!isPowerOf2(parseInt(blockSize))) {
        valid = false;
        setError('block', 'Not a power of 2');
    } else {
        clearError('block');
    }

    if (!setSize) {
        valid = false;
        setError('set', 'Missing input');
    } else if (!isStringInteger(setSize) || !(parseInt(setSize) > 0)) {
        valid = false;
        setError('set', 'Not a positive integer');
    } else if (!isPowerOf2(parseInt(setSize))) {
        valid = false;
        setError('set', 'Not a power of 2');
    } else {
        clearError('set');
    }

    if (!cacheSize) {
        valid = false;
        setError('cache', 'Missing input');
    } else if (!isStringInteger(cacheSize) || !(parseInt(cacheSize) > 0)) {
        valid = false;
        setError('cache', 'Not a positive integer');
    } else if (!isPowerOf2(parseInt(cacheSize))) {
        valid = false;
        setError('cache', 'Not a power of 2');
    } else {
        clearError('cache');
    }

    if (!cacheAccessTime) {
        valid = false;
        setError('cacheTime', 'Missing input');
    } else if (parseFloat(cacheAccessTime) <= 0) {
        valid = false;
        setError('cacheTime', 'Not a positive number');
    } else {
        clearError('cacheTime');
    }

    if (!memorySize) {
        valid = false;
        setError('memory', 'Missing input');
    } else if (!isStringInteger(memorySize) || !(parseInt(memorySize) > 0)) {
        valid = false;
        setError('memory', 'Not a positive integer');
    } else if (!isPowerOf2(parseInt(memorySize))) {
        valid = false;
        setError('memory', 'Not a power of 2');
    } else {
        clearError('memory');
    }

    if (!memoryAccessTime) {
        valid = false;
        setError('memoryTime', 'Missing input');
    } else if (parseFloat(memoryAccessTime) <= 0) {
        valid = false;
        setError('memoryTime', 'Not a positive number');
    } else {
        clearError('memoryTime');
    }

    // error check for tasks
    let currentNumberOfTasks = $('.task-group').length;

    for (let i = 1; i <= currentNumberOfTasks; i++) {
        let lower = $(`#lowerRange-${i}`).val().trim();
        let upper = $(`#upperRange-${i}`).val().trim();
        let loop = $(`#loopCount-${i}`).val().trim();

        keyTasks = {
            lower: $(`#lowerRange-${i}`),
            upper: $(`#upperRange-${i}`),
            loop: $(`#loopCount-${i}`)
        }

        if (!lower) {
            valid = false;
            setErrorTasks('lower', 'Missing input', i);
        } else if (!isStringInteger(lower) || !(parseInt(lower) >= 0)) {
            valid = false;
            setErrorTasks('lower', 'Not a non-negative integer', i);
        } else {
            clearErrorTasks('lower', i);
        }

        if (!upper) {
            valid = false;
            setErrorTasks('upper', 'Missing input', i);
        } else if (!isStringInteger(upper) || !(parseInt(upper) >= 0)) {
            valid = false;
            setErrorTasks('upper', 'Not a non-negative integer', i);
        } else {
            clearErrorTasks('upper', i);
        }

        if (!loop) {
            valid = false;
            setErrorTasks('loop', 'Missing input', i);
        } else if (!isStringInteger(loop) || !(parseInt(loop) > 0)) {
            valid = false;
            setErrorTasks('loop', 'Not a positive integer', i);
        } else {
            clearErrorTasks('loop', i);
        }
    }

    if (valid) {
        removeCacheTable();
        // Show and scroll to Loading
        $('#loading').show();
        scrollTo('#loading');

        // Hide Table 
        $('#cacheResultContainer').hide();

        $.post('/Sequential', {
            tasks,
            inputType,
            blockSize,
            setSize,
            cacheSize,
            cacheSizeDropdown,
            cacheAccessTime,
            memorySize,
            memorySizeDropdown,
            memoryAccessTime
        }, function(data) {
            // Show results
            let valid_post = true;

            // console.log(data);

            if (data.memorySizeError) {
                valid_post = false;
                setError('memory', data.memorySizeError);
                scrollTo('#memorySize');
            }

            if (data.setSizeError) {
                valid_post = false;
                setError('set', data.setSizeError);
                scrollTo('#setSize');
            }

            if (valid_post) {
                loadCacheTable(data.cacheMemory, data.setSize);
                $('#cacheMisses').val(data.cacheMiss);
                $('#cacheHits').val(data.cacheHit);
                $('#totalQueries').val(data.cacheHit + data.cacheMiss);
                $('#missPenalty').val(data.missPenalty);
                $('#averageTime').val(data.aveAccessTime);
                $('#totalTime').val(data.totalAccessTime);

                // Show cache result container
                $('#cacheResultContainer').show();
                scrollTo("#cacheResultContainer");

                $('#saveToFileButton').prop('disabled', false);
            }

            // Hide Loading
            $('#loading').hide();
        });
    }
});

// Sets the error message and change the input to red
function setError(key, err) {
    keyInput[key].addClass('is-invalid');
    $(`#${key}Error`).text(err);
};

// Clears the error message and remove the input to red class
function clearError(key) {
    keyInput[key].removeClass('is-invalid');
    $(`#${key}Error`).text('');
}

// Sets the error message and change the input to red [TASKS]
function setErrorTasks(key, err, i) {
    keyTasks[key].addClass('is-invalid');
    $(`#${key}Error-${i}`).text(err);
};

// Clears the error message and remove the input to red class [TASKS]
function clearErrorTasks(key, i) {
    keyTasks[key].removeClass('is-invalid');
    $(`#${key}Error-${i}`).text('');
}

// If number is power of 2, return 1, else return 0.
function isPowerOf2(number) {
    if (number == 0) {
        return 0;
    }

    while (number != 1) {
        number = number / 2;
        if (number % 2 != 0 && number != 1) {
            return 0;
        }
    }
    return 1;
}

// Returns array containing Task objects
function getArrayOfTasks() {
    let currentNumberOfTasks = $('.task-group').length;
    let lowerRangeArray = $('.lower-range').map(function() { return this.value.trim(); }).get();
    let upperRangeArray = $('.upper-range').map(function() { return this.value.trim(); }).get();
    let loopCountArray = $('.loop-count').map(function() { return this.value.trim(); }).get();
    let tasks = [];

    for (let i = 0; i < currentNumberOfTasks; i++) {
        tasks.push({
            lowerRange: lowerRangeArray[i],
            upperRange: upperRangeArray[i],
            loopCount: loopCountArray[i]
        });
    }
    return tasks;
}

// Renders Cache Memory to table
function loadCacheTable(cacheMemory, setSize) {

    // Create new table showing cache memory
    let table = $(`<table class="table table-bordered" id="cacheTable">
                        <thead>
                            <tr>
                                <th scope="col">Set</th>
                                <th colspan="${setSize}"></th>
                            </tr>
                        </thead>
                        <tbody id="tableBody">
                        </tbody>
                    </table>`);

    for (let i = 0; i < cacheMemory.length; i++) {
        let row = $(`<tr><th scope="row">${i}</th></tr>`);

        for (let j = 0; j < setSize; j++) {
            cacheMemory[i].cache[j] === undefined ? row.append(`<td></td>`) : row.append(`<td>${cacheMemory[i].cache[j]}</td>`);
        }
        table.append(row);
    }

    // Append table to <div> tableHolder
    $('#tableHolder').append(table);
}

function removeCacheTable() {
    $('#cacheTable').remove();
}

function scrollTo(area) {
    let offset = $(`${area}`).offset();
    offset.left -= 20;
    offset.top -= 20;
    $('html, body').animate({
        scrollTop: offset.top,
        scrollLeft: offset.left
    });
}

function isStringInteger(str) {
    return /^\+?(0|[1-9]\d*)$/.test(str);
}