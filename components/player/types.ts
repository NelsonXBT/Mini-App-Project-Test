export interface IMEPlayerProps {
  src: string;
  title?: string;
  poster?: string;
}

export interface PlayerState {
  playing: boolean;
  loading: boolean;
  muted: boolean;
  volume: number;
  currentTime: number;
  duration: number;
  buffered: number;
  fullscreen: boolean;
}