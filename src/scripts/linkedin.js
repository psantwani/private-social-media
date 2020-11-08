import $ from "jquery";

const OBSERVER_ROOT = "core-rail";
const DETECT_CLASS = "comments-comment-box__form";
const COMMENT_CLASS = ".comments-comment-box-comment__text-editor";
const ICON_CLASS = ".comments-comment-box__button-group";
const SUBMIT_CLASS = ".comments-comment-box__submit-button";
const POST_CLASS = ".feed-shared-update-v2";
let globallyLocked = false;

const hasClass = (element, className) => {
  return (" " + element.className + " ").indexOf(" " + className + " ") > -1;
};

const globalLockIconHtml = `
    <div class="private-social-media-lock-emoji-container global">
        <span class="lock unlocked"></span>
    </div>`;


const addPrivateIcon = (parentEl) => {
  const target = $(parentEl) ? $(parentEl).find(ICON_CLASS) : null;
  if (target && target.length) {
    const lockIconHtml = `
    <div class="private-social-media-lock-emoji-container">
        <span class="lock ${globallyLocked ? '' : 'unlocked'}"></span>
    </div>`;

    $(lockIconHtml).insertBefore(target[0]);
  }
};

const detectComment = (parentEl) => {
  if (!$(parentEl)) {
    return;
  }

  $(parentEl).on("keyup", () => {
    const target = $(parentEl) ? $(parentEl).find(COMMENT_CLASS) : null;
    if (!target) {
      return;
    }

    const comment = $.trim($(target).text());
    if (!comment) {
      $(parentEl).removeClass("private-social-media-listener-attached");
      return;
    }

    if (!hasClass(parentEl, "private-social-media-listener-attached")) {
      addPostBtnClickDetector(parentEl, { commentEl: target });
    }
  });
};

const addPostBtnClickDetector = (parentEl, attachedElements) => {
  const target = $(parentEl) ? $(parentEl).find(SUBMIT_CLASS) : null;
  if (target && target.length) {
    attachedElements["submitEl"] = target[0];

    $(target[0]).on("click", (event) => {
      onPostBtnClick(event, parentEl, attachedElements);
    });

    $(parentEl).addClass("private-social-media-listener-attached");
  }
};

const onPostBtnClick = (event, parentEl, attachedElements) => {
  const lockEl = $(parentEl).find(
    ".private-social-media-lock-emoji-container .lock"
  )[0];

  if (!hasClass(lockEl, "unlocked")) {
    event.preventDefault();

    const commentEl = attachedElements["commentEl"];
    const comment = $.trim($(commentEl).text());

    $(commentEl).find("p").text("");
    saveComment(parentEl, comment);
  }

  $(parentEl).removeClass("private-social-media-listener-attached");
};

const saveComment = (parentEl, comment) => {
  const target = $(parentEl).closest(POST_CLASS);
  if (!target) {
    return;
  }

  alert(
    "Posting your comment privately - " +
      comment +
      " for post " +
      $(target[0]).attr("data-urn")
  );
};

/*
const saveComment2 = (parentEl, comment) => {
  const closest = $(parentEl).closest(POST_CLASS);
  if(!closest){
    return;
  }
  
  let target = closest.parent();
  let attempts = 3;
  
  while(!$(target).attr("data-id") && attempts > 0){
    target = $(target).parent();
    attempts--;
  }

  alert("Posting your comment privately - " + comment + " for post " + $(target).attr("data-id"));
}
*/

const doAction = (element) => {
  addPrivateIcon(element);
  detectComment(element);
};

$(document).on("click", ".lock", function (e) {
  $(e.currentTarget).toggleClass("unlocked");  
  if ( hasClass($(e.currentTarget).parent()[0], "global")) {
    const unlocked = hasClass($(e.currentTarget)[0], "unlocked");
    globallyLocked = !unlocked;
  }
});

const elementsOnLoad = document.getElementsByClassName(DETECT_CLASS);
for (var i = 0; i < elementsOnLoad.length; i++) {
  doAction(elementsOnLoad.item(i));
}

let observer = new MutationObserver((mutations) => {
  for (let mutation of mutations) {
    for (let node of mutation.addedNodes) {
      if (!(node instanceof HTMLElement)) continue;
      if (hasClass(node, DETECT_CLASS)) {
        doAction(node);
      }
    }
  }
});

const root = document.getElementsByClassName(OBSERVER_ROOT)[0];
observer.observe(root, { childList: true, subtree: true });

$(globalLockIconHtml).insertBefore(".global-nav__branding");