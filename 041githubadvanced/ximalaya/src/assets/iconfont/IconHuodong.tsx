/* tslint:disable */
/* eslint-disable */

import React, { FunctionComponent } from 'react';
import { ViewProps } from 'react-native';
import { Svg, GProps, Path } from 'react-native-svg';
import { getIconColor } from './helper';

interface Props extends GProps, ViewProps {
  size?: number;
  color?: string | string[];
}

let IconHuodong: FunctionComponent<Props> = ({ size, color, ...rest }) => {
  return (
    <Svg viewBox="0 0 1024 1024" width={size} height={size} {...rest}>
      <Path
        d="M849.256296 511.81037c0-0.284444 0-0.568889 0-0.948148l0-132.740741c0-9.576296-9.671111-16.497778-23.04-16.497778l-74.619259-0.18963c7.395556-9.481481 12.98963-20.859259 15.36-34.797037 5.30963-31.952593-2.56-64.094815-20.954074-85.902222-15.834074-18.773333-38.020741-28.634074-63.905185-28.634074-30.056296 0-58.026667 14.506667-78.885926 40.77037-10.145185 12.894815-18.299259 28.254815-23.893333 44.562963-9.291852-4.456296-21.333333-7.395556-36.408889-8.817778-3.413333-0.284444-6.826667-0.474074-10.05037-0.474074-15.739259 0-29.771852 3.697778-41.054815 10.808889-2.180741-4.645926-5.12-10.145185-9.102222-16.687407-23.04-38.874074-51.38963-66.275556-75.946667-73.291852-17.92-5.12-32.900741-5.404444-45.89037-0.758519-11.188148 3.982222-20.385185 11.472593-27.97037 22.85037-11.472593 17.256296-13.368889 48.071111-13.653333 55.277037-0.094815 0.568889-0.18963 1.232593-0.18963 1.801481 0 4.645926 3.223704 8.722963 7.68 10.24 0.568889 5.30963 5.404444 9.481481 11.282963 9.481481 6.257778 0 11.377778-4.740741 11.377778-10.524444 0-0.284444 0-0.474074 0-0.758519 0.379259-11.567407 3.223704-32.521481 9.291852-41.623704 7.016296-10.524444 17.92-20.100741 46.08-12.136296 13.368889 3.792593 36.977778 21.902222 59.733333 60.302222 4.266667 7.205926 6.826667 12.325926 8.438519 15.834074-2.180741 4.361481-3.697778 9.007407-4.361481 13.748148-1.517037 11.472593-0.948148 20.859259 1.611852 28.444444l-0.094815 0.094815c-0.18963 0-0.379259 0-0.663704 0-6.731852 0.284444-20.48 0.948148-33.28 0-0.18963-0.18963-0.379259-0.284444-0.663704-0.284444l-2.37037 0c-6.447407-0.568889-12.420741-1.611852-17.066667-3.318519-16.687407-6.162963-43.425185-18.204444-64.948148-27.97037-14.127407-6.352593-25.315556-11.377778-31.099259-13.653333-22.091852-8.533333-48.45037-17.256296-82.488889-11.946667-60.207407 9.386667-62.862222 49.588148-62.957037 51.294815l0 0c0 0.094815 0 0.284444 0 0.379259 0 5.973333 5.214815 10.808889 11.662222 10.808889 0.094815 0 0.094815 0 0.18963 0 1.327407 0 2.654815 0.663704 3.508148 1.706667 1.991111 2.654815 5.404444 4.361481 9.102222 4.361481 5.973333 0 10.808889-4.266667 11.188148-9.671111l0.094815 0c0-0.18963 2.180741-21.997037 41.528889-28.16 27.117037-4.266667 48.260741 2.74963 67.602963 10.24 5.025185 1.991111 16.023704 6.921481 28.728889 12.705185 1.801481 0.758519 3.602963 1.611852 5.404444 2.465185L237.985185 361.623704c-13.368889 0-23.04 6.921481-23.04 16.497778l0 125.25037 0 24.651852 50.441481 0 0 269.653333c0 11.851852 9.291852 21.522963 20.764444 21.522963L779.377778 819.2c11.472593 0 20.764444-9.671111 20.764444-21.522963L800.142222 527.928889l49.208889 0L849.256296 511.81037zM602.737778 301.226667c13.937778-30.72 39.632593-54.423704 72.628148-54.423704 18.10963 0 33.374815 6.731852 44.278519 19.531852 13.558519 15.928889 19.152593 40.011852 15.17037 64.284444-2.180741 12.8-8.343704 22.565926-17.161481 30.72l-115.674074-0.18963c0 0 0 0 0 0 2.939259-7.86963 3.602963-17.825185 2.085926-30.625185-0.758519-5.973333-2.56-11.377778-5.404444-16.213333C599.798519 309.854815 601.220741 305.493333 602.737778 301.226667zM520.533333 784.877037 297.528889 784.877037l0-256.948148L520.533333 527.928889 520.533333 784.877037zM520.533333 503.371852 250.216296 503.371852 250.216296 390.352593l175.976296-0.18963c0.18963 0 0.284444 0 0.379259-0.094815l12.041481 0c0.094815 0 0.18963 0 0.379259-0.094815 4.93037 0.284444 9.860741 0.474074 14.506667 0.474074 2.74963 0 5.404444 0 7.86963-0.094815L520.533333 390.352593 520.533333 503.371852zM526.317037 360.675556c-2.844444 0.094815-5.594074 0.18963-8.248889 0.284444l-8.722963 0c-8.248889-0.284444-12.98963-1.611852-15.265185-4.171852-0.853333-1.042963-1.611852-2.465185-2.085926-4.266667-0.094815-2.74963 0.18963-5.973333 0.568889-9.481481 1.517037-11.567407 15.54963-23.22963 39.348148-23.22963 2.465185 0 5.025185 0.094815 7.49037 0.379259 36.503704 3.508148 37.925926 15.36 38.494815 20.48 0.853333 6.921481 0.758519 11.757037 0.18963 15.075556-4.456296 4.645926-18.773333 4.645926-32.711111 4.645926l-3.792593 0C536.462222 360.296296 531.342222 360.485926 526.317037 360.675556zM766.293333 784.877037 544.331852 784.877037l0-256.948148 221.961481 0L766.293333 784.877037zM812.468148 503.371852 544.331852 503.371852 544.331852 390.352593l268.136296 0L812.468148 503.371852z"
        fill={getIconColor(color, 0, '#333333')}
      />
    </Svg>
  );
};

IconHuodong.defaultProps = {
  size: 18,
};

IconHuodong = React.memo ? React.memo(IconHuodong) : IconHuodong;

export default IconHuodong;