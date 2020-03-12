/**
 * Sample React Native App
 * https://github.com/facebook/react-native
 * @flow
 */

import React, { Component } from 'react';
import {
  Platform,
  StyleSheet,
  Text,
  View,
} from 'react-native';

import {
  requireNativeComponent,
  findNodeHandle,
  NativeModules
} from 'react-native';

import F2 from '@antv/f2';
// import { gcanvas as GCanvasContext } from '@antv/f2-context';
import data from './data';


import {
  GCanvasView,
} from 'react-native-gcanvas';

import { enable, ReactNativeBridge, Image as GImage } from "@gcanvas/core/src/index.js";

ReactNativeBridge.GCanvasModule = NativeModules.GCanvasModule;
ReactNativeBridge.Platform = Platform;

function strLen(str: string) {
  let len = 0;
  for (let i = 0; i < str.length; i++) {
    if (str.charCodeAt(i) > 0 && str.charCodeAt(i) < 128) {
      len++;
    } else {
      len += 2;
    }
  }
  return len;
}

function convertTouches(touches) {
  if (!touches || !touches.length) {
    return [];
  }
  return touches.map(item => {
    return {
      x: item.pageX,
      y: item.pageY
    }
  });
}

function convertEvent(nativeEvent) {
  const touches = convertTouches(nativeEvent.touches);
  const changedTouches = convertTouches(nativeEvent.changedTouches);
  return {
    preventDefault: function() {},
    touches,
    changedTouches,
  }
}

export default class App extends Component {
  constructor(props){
    super(props);
  }

  componentDidMount() {
    // TODO: 需要处理下ready，目前还不知道怎么处理
    // this.draw();
  }

  // 官方案例
  draw = () => {
    var ref = this.refs.canvas_holder;
    var canvas_tag = findNodeHandle(ref);
    var el = { ref: "" + canvas_tag, style: { width: 414, height: 300 } };
    ref = enable(el, { bridge: ReactNativeBridge });

    // 适配gcanvas 的context
    var ctx = ref.getContext('2d');
    ctx.measureText = (text) => {
      let fontSize = 12;
      const font = ctx.font;
      if (font) {
        fontSize = parseInt(font.split(' ')[3], 10);
      }
      fontSize /= 2;
      return {
        width: strLen(text) * fontSize
      };
    }

    const chart = new F2.Chart({
      context: ctx,
      width: 414,
      height: 300,
      pixelRatio: 1,
    });
    chart.source(data, {
      reportDateTimestamp: {
        type: 'timeCat',
        tickCount: 3,
        range: [0, 1],
        mask: 'YYYY-MM-DD'
      },
      rate: {
        tickCount: 5
      }
    });

    chart.interval()
      .position('reportDateTimestamp*rate').animate(false);

    chart.interaction('pinch');
    chart.interaction('pan');

    chart.render();

    chart.get('canvas').on('pinch', (e) => {
      console.log(e)
    })

    const interactionContext = chart.get('interactionContext');
    interactionContext.start();
    interactionContext.doZoom(0.5, 0.5, 1.2);

    this.chart = chart;
  }

  onTouchStart = (e) => {
    if (!this.chart) {
      return;
    }
    const ev = convertEvent(e.nativeEvent);
    this.chart.get('el').dispatchEvent('touchstart', ev);
  }

  onTouchMove = (e) => {
    if (!this.chart) {
      return;
    }
    const ev = convertEvent(e.nativeEvent);
    this.chart.get('el').dispatchEvent('touchmove', ev);
  }

  onTouchEnd = (e) => {
    if (!this.chart) {
      return;
    }
    const ev = convertEvent(e.nativeEvent);
    this.chart.get('el').dispatchEvent('touchend', ev);
  }

  render() {
    return (
      <View style={styles.container}>
        <Text style={styles.welcome}
        onPress={this.draw}
        >
          React Native + GCanvas
        </Text>
        <View
          onTouchStart={ this.onTouchStart }
          onTouchMove={ this.onTouchMove }
          onTouchEnd={ this.onTouchEnd }
        >
          <GCanvasView
            ref='canvas_holder'
            style={styles.gcanvas}
          >
          </GCanvasView>
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  gcanvas: {
    width: 414,
    height: 300,
  },
  container: {
    paddingTop: 50,
    flex: 1,
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
  },
});