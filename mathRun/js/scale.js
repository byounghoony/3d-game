function isMobile() {
  // return /Mobi|Android/i.test(navigator.userAgent) || window.innerWidth < 768;
  return false;
};

function initScale(element) {
  function getContainerSize() {
    return {
      width: document.body.clientWidth,
      height: document.body.clientHeight,
    };
  };

  function getZoomRate({containerSize, target}) {
    const containerWidth = containerSize.width;
    const containerHeight = containerSize.height;
    const horizontalValue = containerWidth / target.width;
    const verticalValue = containerHeight / target.height;
    console.log(containerWidth, containerHeight, target);

    return target.width * verticalValue > containerWidth && !isMobile() ? horizontalValue : verticalValue;
  };

  function getLeftValue({containerSize, target, zoomRate}) {
    return (containerSize.width - target.width * zoomRate) / 2;
  };

  function getTopValue({containerSize, target, zoomRate}) {
    return (containerSize.height - target.height * zoomRate) / 2;
  };

  function setTransform({zoomRate, leftValue, topValue, element}) {
    const style = element.style;

    style.transform = `scale(${zoomRate})`;
    style.MsTransform = `scale(${zoomRate})`;
    style.MozTransform = `scale(${zoomRate})`;
    style.WebkitTransform = `scale(${zoomRate})`;

    style.transformOrigin = '0% 0%';
    style.MsTransformOrigin = '0% 0%';
    style.MozTransformOrigin = '0% 0%';
    style.WebkitTransformOrigin = '0% 0%';

    style.left = `${leftValue}px`;
    style.top = `${topValue}px`;
  };

  const target = { width: isMobile() ? 360 : 1920, height: isMobile() ? 780 : 1080 }

  const setScale = () => {
    const containerSize = getContainerSize();
    const zoomRate = getZoomRate({containerSize, target});
    const leftValue = getLeftValue({containerSize, target, zoomRate});
    const topValue = getTopValue({containerSize, target, zoomRate});

    setTransform({zoomRate, leftValue, topValue, element});
    window.currentZoom = zoomRate;
    window.scaleLeft = leftValue;
    window.scaleTop = topValue;
  };

  setScale();
  window.addEventListener('resize', setScale);
};

initScale(document.querySelector('.js-scale'));