import { ComponentFixture, TestBed } from '@angular/core/testing';
import { RouterTestingModule } from '@angular/router/testing';
import { SidebarComponent } from '@app/components/sidebar/sidebar.component';
import { Messenger } from '@app/services/messenger';

describe('SidebarComponent', () => {
    let component: SidebarComponent;
    let fixture: ComponentFixture<SidebarComponent>;

    let messengerSpy: jasmine.SpyObj<Messenger>;

    beforeEach(async () => {
        await TestBed.configureTestingModule({
            imports: [RouterTestingModule],
            declarations: [SidebarComponent]
        }).compileComponents();
    });

    beforeEach(() => {
        fixture = TestBed.createComponent(SidebarComponent);
        component = fixture.componentInstance;

        messengerSpy = jasmine.createSpyObj('messenger', ['send']);
        component.messenger = messengerSpy;

        fixture.detectChanges();
    });

    it('should create', () => {
        expect(component).toBeTruthy();
    });

    it('should set messageContent to "" in the cosntructor', () => {
        expect(component.messageContent).toBe('');
    });

    it('should set messageContent to target value', () => {
        const event = {
            target: {
                value: 'test message'
            }
        } as unknown as Event;

        component.setContent(event);
        expect(component.messageContent).toEqual('test message');
    });

    it('should call messenger.send() with "test" and "test message" and set messengerContent to "" when send() is called', () => {
        const username = 'test';
        const messageContent = 'test message';

        component.username = username;
        component.messageContent = messageContent;
        component.send();
        expect(messengerSpy.send).toHaveBeenCalledWith(username, messageContent);
        expect(component.messageContent).toBe('');
    });

    it('should not call messenger.send() when send() is called and messageContent is empty', () => {
        component.send();
        expect(messengerSpy.send).not.toHaveBeenCalled();
    });

    it('should call clicked.emit() when clickChat() is called', () => {
        const clickedSpy = spyOn(component.clicked, 'emit');
        component.clickChat();
        expect(clickedSpy).toHaveBeenCalled();
    });

    it('should call unclicked.emit() when closeChat() is called', () => {
        const unclickedSpy = spyOn(component.unclicked, 'emit');
        component.closeChat();
        expect(unclickedSpy).toHaveBeenCalled();
    });

    it('should call setContent() when textarea change event is triggered', () => {
        const setContentSpy = spyOn(component, 'setContent');
        const textarea = fixture.nativeElement.querySelector('textarea');
        textarea.dispatchEvent(new Event('change'));
        expect(setContentSpy).toHaveBeenCalled();
    });

    it('should set value of textarea to messageContent', () => {
        component.messageContent = 'test message';
        fixture.detectChanges();
        const textarea = fixture.nativeElement.querySelector('textarea');
        expect(textarea.value).toEqual('test message');
    });

    it('should set disabled attribute of textarea to true when canSend is false', () => {
        component.canSend = false;
        fixture.detectChanges();
        const textarea = fixture.nativeElement.querySelector('textarea');
        expect(textarea.disabled).toBeTrue();
    });

    it('should set disabled attribute of textarea to false when canSend is true', () => {
        component.canSend = true;
        fixture.detectChanges();
        const textarea = fixture.nativeElement.querySelector('textarea');
        expect(textarea.disabled).toBeFalse();
    });

    it('should call clickChat() when textarea focus event is triggered', () => {
        const clickChatSpy = spyOn(component, 'clickChat');
        const textarea = fixture.nativeElement.querySelector('textarea');
        textarea.dispatchEvent(new Event('focus'));
        expect(clickChatSpy).toHaveBeenCalled();
    });

    it('should call closeChat() when textarea blur event is triggered', () => {
        const closeChatSpy = spyOn(component, 'closeChat');
        const textarea = fixture.nativeElement.querySelector('textarea');
        textarea.dispatchEvent(new Event('blur'));
        expect(closeChatSpy).toHaveBeenCalled();
    });

    it('should call send() on click of the send button', () => {
        const sendSpy = spyOn(component, 'send');
        const button = fixture.nativeElement.querySelector('button');
        button.dispatchEvent(new Event('click'));
        expect(sendSpy).toHaveBeenCalled();
    });

    it('should set disabled attribute of the send button to true when canSend is false', () => {
        component.canSend = false;
        fixture.detectChanges();
        const button = fixture.nativeElement.querySelector('button');
        expect(button.disabled).toBeTrue();
    });
});
