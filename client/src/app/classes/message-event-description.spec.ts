import { Message } from "@common/message";
import { MessageEventDescription } from "./message-event-description";


describe('MessageEventDescription', () => {

    let event: MessageEventDescription;

    let message: Message;
    const time = 10;
    const testContent = 'test';
    const testSender = 'sender';

    beforeEach(() => {
        message = new Message(testContent, testSender)

        event = new MessageEventDescription(time, message);
    });

    it('should create an instance', () => {
        expect(event).toBeTruthy();
    });

    it('should create an instance with correct attributes', () => {
        expect(event.time).toEqual(time);
        expect(event['message']).toEqual(message);
    });

    it('play should add class message to messenger', () => {
        const replayPage = jasmine.createSpyObj('ReplayPageComponent', ['gamePageElem']);
        const gamePageElem = jasmine.createSpyObj('GamePageComponent', ['sidebar']);
        const sidebar = jasmine.createSpyObj('Sidebar', ['messenger']);
        const messenger = jasmine.createSpyObj('Messenger', ['addMessage']);
        replayPage.gamePageElem = gamePageElem;
        gamePageElem.sidebar = sidebar;
        sidebar.messenger = messenger;
        event.play(replayPage);
        expect(messenger.addMessage).toHaveBeenCalledWith(message);
    });
});