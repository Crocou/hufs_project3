//서로 다른 스크린에서 발생하는 이벤트가 다른 스크린에 영향을 미칠 때 
//각 스크린 간의 실시간 데이터 동기화를 위한 도구
import { EventEmitter } from 'events';
export const eventEmitter = new EventEmitter();
