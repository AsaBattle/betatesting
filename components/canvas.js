import React from "react";
import Image from "next/image";
import { ReactSketchCanvas } from "react-sketch-canvas";
import Spinner from "components/spinner";

export default class Canvas extends React.Component {
  constructor(props) {
    super(props);
    this.canvas = React.createRef();
    this.state = {
      brushPreviewPosition: { x: 0, y: 0 },
      showBrushPreview: false,
    };
    // Throttle the handleMouseMove method to only execute once every 10 milliseconds
    this.handleMouseMove = throttle(this.handleMouseMove.bind(this), 10);
  }

  onChange = async () => {
    const paths = await this.canvas.current.exportPaths();
    if (paths.length) {
      const data = await this.canvas.current.exportImage("svg");
      this.props.onDraw(data);
    }
  };

  handleMouseMove(event) {
    const canvasRect = this.canvas.current.wrapper.getBoundingClientRect();
    this.setState({
      brushPreviewPosition: {
        x: event.clientX - canvasRect.left,
        y: event.clientY - canvasRect.top,
      },
    });
  };
  

  handleMouseEnter = () => {
    this.setState({ showBrushPreview: true });
  };

  handleMouseLeave = () => {
    this.setState({ showBrushPreview: false });
  };

  render() {
    const { brushPreviewPosition, showBrushPreview } = this.state;

    const predictions = this.props.predictions.map((prediction) => {
      prediction.lastImage = prediction.output
        ? prediction.output[prediction.output.length - 1]
        : null;
      return prediction;
    });

    const predicting = predictions.some((prediction) => !prediction.output);
    const lastPrediction = predictions[predictions.length - 1];

    return (
      <div
      className="relative w-full aspect-square"
      onMouseMove={this.handleMouseMove} // This should be attached to the same div that receives the onMouseEnter and onMouseLeave
      onMouseEnter={this.handleMouseEnter}
      onMouseLeave={this.handleMouseLeave}
      style={{
        cursor: `url('/pen-cursor(w)2.png'), auto` // Make sure to have a 'pencil-cursor.png' in your public folder
      }}
    >
        {/* PREDICTION IMAGES */}
        {!this.props.userUploadedImage && predictions.filter((prediction) => prediction.output).map((prediction, index) => (
          <Image
            alt={"prediction" + index}
            key={"prediction" + index}
            layout="fill"
            className="absolute animate-in fade-in"
            style={{ zIndex: index }}
            src={prediction.lastImage}
          />
        ))}

        {/* USER UPLOADED IMAGE */}
        {this.props.userUploadedImage && (
          <Image
            src={URL.createObjectURL(this.props.userUploadedImage)}
            alt="preview image"
            layout="fill"
          />
        )}

        {/* SPINNER */}
        {predicting && (
          <div
            className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
            style={{ zIndex: predictions.length + 100 }}
          >
            <div className="p-4 w-40 bg-white text-center rounded-lg animate-in zoom-in">
              <Spinner />
              <p className="pt-3 opacity-30 text-center text-sm">
                {lastPrediction.status}
              </p>
            </div>
          </div>
        )}

        {/* Brush Preview */}
        {showBrushPreview && (
          <div
            style={{
              position: 'absolute',
              left: `${brushPreviewPosition.x}px`,
              top: `${brushPreviewPosition.y}px`,
              width: `${this.props.brushSize}px`,
              height: `${this.props.brushSize}px`,
              borderRadius: '50%',
              backgroundColor: 'rgba(255, 255, 255, 0.5)', // Semi-transparent white circle
              transform: 'translate(-50%, -50%)',
              pointerEvents: 'none',
            }}
          />
        )}

        {/* CANVAS FOR DRAWING */}
        {(predictions.length > 0 || this.props.userUploadedImage) && !predicting && (
          <div
            className="absolute top-0 left-0 w-full h-full"
            style={{ zIndex: predictions.length + 100 }}
          >
            <ReactSketchCanvas
              ref={this.canvas}
              strokeWidth={this.props.brushSize}
              strokeColor="white"
              canvasColor="transparent"
              onChange={this.onChange}
            />
          </div>
        )}
      </div>
    );
  }
}
