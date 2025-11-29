import postmonger from "postmonger";

const connection = new postmonger.Session();

// Wait for the document to load before we doing anything
document.addEventListener("DOMContentLoaded", function main() {
  // Setup a test harness so we can interact with our custom activity
  // outside of journey builder using window functions & browser devtools.
  // This isn't required by your activity, its for example purposes only
  setupExampleTestHarness();

  // setup our ui event handlers
  setupEventHandlers();

  // Bind the initActivity event...
  // Journey Builder will respond with "initActivity" after it receives the "ready" signal
  connection.on("initActivity", onInitActivity);

  // We're all set! let's signal Journey Builder
  // that we're ready to receive the activity payload...

  // Tell the parent iFrame that we are ready.
  connection.trigger("ready");
});

// this function is triggered by Journey Builder via Postmonger.
// Journey Builder will send us a copy of the activity here
function onInitActivity(payload) {
  payload = incomingPayload;

  // Carregar dados salvos anteriormente
  if (
    payload["arguments"] &&
    payload["arguments"].execute &&
    payload["arguments"].execute.inArguments[0]
  ) {
    const inArgs = payload["arguments"].execute.inArguments[0];

    if (inArgs.setting1) {
      document.getElementById("setting1").value = inArgs.setting1;
    }
    if (inArgs.setting2) {
      document.getElementById("setting2").value = inArgs.setting2;
    }
  }
}

function onDoneButtonClick() {
  console.log("onDoneButtonClick");
}

function onCancelButtonClick() {
  console.log("onCancelButtonClick");
}
