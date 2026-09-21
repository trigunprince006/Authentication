// ============================================================
// pipeline.js
// ------------------------------------------------------------
// Purely visual. It lights up the steps in the left rail so you
// can SEE the request travel from the form to MongoDB.
// register.js and login.js call these three functions.
// ============================================================

const pipelineSteps = document.querySelectorAll(".pipe-step");
let pipelineTimers = [];

// Turn every step off again.
function pipelineReset() {
  pipelineTimers.forEach(clearTimeout);
  pipelineTimers = [];
  pipelineSteps.forEach((step) => step.classList.remove("is-active", "is-done"));
}

// Light the steps up one after another (200 ms apart).
function pipelineStart() {
  pipelineReset();

  pipelineSteps.forEach((step, index) => {
    // The last step means "finished", so we leave it for pipelineFinish().
    if (index === pipelineSteps.length - 1) return;

    const timer = setTimeout(() => {
      if (index > 0) pipelineSteps[index - 1].classList.replace("is-active", "is-done");
      step.classList.add("is-active");
    }, index * 200);

    pipelineTimers.push(timer);
  });
}

// Called once the server has answered.
function pipelineFinish(wasSuccessful) {
  pipelineTimers.forEach(clearTimeout);
  pipelineTimers = [];

  if (wasSuccessful) {
    pipelineSteps.forEach((step) => {
      step.classList.remove("is-active");
      step.classList.add("is-done");
    });
  } else {
    // Something failed, so the journey never reached the end.
    pipelineReset();
  }
}
