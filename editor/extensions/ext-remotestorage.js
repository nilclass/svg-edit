/*
 * ext-remotestorage.js
 *
 * Licensed under the MIT License
 *
 * Copyright(c) 2013 Niklas E. Cathor
 *
 */

svgEditor.addExtension("remotestorage", {

  callback: function() {

    remoteStorage.claimAccess('pictures', 'rw');
    remoteStorage.displayWidget();

    var album = remoteStorage.pictures.openPublicAlbum('svg-edit');

    var lastFileName = 'unnamed.svg';

    svgEditor.setCustomHandlers({
      open: function() {
        console.trace();
        var cancelButton;
        var container, loading;
        var openDialog = $('<div>').
          attr('id', 'remotestorage_open_dialog').
          append(
            $('<div>').
              attr('class', 'overlay')
          ).
          append(
            $('<div>').
              attr('class', 'inner').
              append(
                $('<div>').
                  attr('class', 'toolbar_button').
                  append(
                    cancelButton = $('<button>').
                      attr('class', 'cancel_button').
                      text('Cancel')
                  )
              ).
              append(
                container = $('<ul>').
                  attr('class', 'file-list').
                  append(
                    loading = $('<em>Loading...</em>')
                  )
              )
          );

        album.list().then(function(list) {
          loading.remove();
          list.forEach(function(name) {
            container.append($('<li>').text(name));
          });
        });

        container.click(function(event) {
          if(event.target.tagName === 'LI') {
            svgEditor.openPrep(function(ok) {
              if(!ok) return;
              svgCanvas.clear();
              album.load(event.target.innerHTML).then(function(file) {
                svgEditor.loadFromString(file.data);
                svgEditor.updateCanvas();
                openDialog.remove();
              });
            });
          }
        });

        cancelButton.click(function() {
          openDialog.remove();
        });

        $(document.body).prepend(openDialog);
      },

      save: function(win, data) {
        var svg = '<?xml version="1.0"?>\n' + data;
        var fileName = prompt("Enter a filename", lastFileName);
        if(! fileName) {
          return;
        }
        lastFileName = fileName; 
        album.store('image/svg+xml', lastFileName, svg, true).
          then(function() {
            alert('saved.');
          });
      }
    });
  }

});
