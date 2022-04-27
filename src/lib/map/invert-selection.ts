import * as L from "leaflet";

export const control = {
  invertSelection: (callback: (arg0: MouseEvent) => void, options?: L.ControlOptions) => {
    let InvertSelection = L.Control.extend({
      options: {
        position: "topright"
      },
      initialize: function (options: any) {
        L.Util.setOptions(this, options);
      },
      onAdd: function (map: L.Map) {
        let centerContent = [
          "is-flex is-align-content-center",
          "is-align-items-center",
          "is-justify-content-center"
        ].join(" ");

        let container = L.DomUtil.create(
          "div",
          "select-all-container leaflet-control-layers leaflet-control"
        );
        container.addEventListener("click", callback);
        let button = L.DomUtil.create(
          "a",
          "leaflet-control-layers-toggle " + centerContent,
          container
        );
        button.style.backgroundImage = "none";
        let icon = L.DomUtil.create(
          "ion-icon",
          "select-all-icon",
          button
        );
        icon.style.pointerEvents = "none";
        icon.setAttribute("name", "extension-puzzle");
        icon.setAttribute("size", "large");
        icon.style.color = "#a0a0a0";
        return container;
      }
    });
    return new InvertSelection(options);
  }
}
