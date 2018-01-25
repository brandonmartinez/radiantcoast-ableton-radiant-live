///////////////////////////////////////////////
// Radiant Live
///////////////////////////////////////////////
// Main JavaScript methods to process the
// Ableton Live set
///////////////////////////////////////////////


///////////////////////////////////////////////
// Global Setup
///////////////////////////////////////////////

// Number of I/O
outlets = 1;

// Global Variables to Expose
var radiantLiveEnabled = true;


///////////////////////////////////////////////
// Main Application
///////////////////////////////////////////////

function log(message) {
    post('Radiant Live: ' + message + '\n');
}

function cb(args) {
    if (!radiantLiveEnabled) {
        return;
    }

    if (args[0] === 'playing_slot_index') {
        var state = parseInt(args[1], 10);

        if (state >= 0) {
            var slots = this.get('clip_slots');
            var trackColor = this.get('color');
            var id = this.path.replace(/['"]+/g, '') + ' clip_slots ' + state + ' clip'; //'
            outlet(0, trackColor, id);
        }
    }
}

function processTrack(liveAPI) {
    // liveAPI continues to get reused with the path changing; be sure to manage that state
    var trackPath = liveAPI.path;
    var trackColor = liveAPI.get('color');
    var trackName = liveAPI.get('name');
    var clipSlotCount = liveAPI.getcount('clip_slots');

    log('Processing Track ' + trackName);

    for (var j = 0; j < clipSlotCount; j++) {
        var clipSlotPath = trackPath.replace(/['"]+/g, '') + ' clip_slots ' + j; //'
        liveAPI.path = clipSlotPath;
        var hasClipRaw = liveAPI.get('has_clip');
        
        var hasClip = parseInt(hasClipRaw, 10);

        if (hasClip === 1) {
            var clipPath = clipSlotPath + ' clip';
            liveAPI.path = clipPath;
            liveAPI.set('color', trackColor);

            if (trackName.indexOf('Click Track', 0) === -1) {
                liveAPI.set('name', trackName);
            } else {
                var clipName = liveAPI.get('name');
                var scenePath = 'live_set scenes ' + j;
                liveAPI.path = scenePath;
                liveAPI.set('name', clipName);
            }
        }
    }
}

function processTracksAndClips() {
    log('Starting to Process Tracks and Clips.')

    var liveAPI = new LiveAPI(null, 'live_set');
    var trackCount = liveAPI.getcount('tracks');

    for (var i = 0; i < trackCount; i++) {
        log('Processing Track #' + (i + 1));
        liveAPI.path = 'live_set tracks ' + i;
        processTrack(liveAPI);
    }
}