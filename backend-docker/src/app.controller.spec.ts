import { AppController } from '#src/app.controller.js';

describe('AppController', () => {
  it('render view home không dùng layout chung', () => {
    expect(new AppController().home()).toEqual({ layout: false });
  });
});
