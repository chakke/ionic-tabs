import { Component } from '@angular/core';
import { IonicPage, NavController, NavParams, Slides } from 'ionic-angular';
import { ViewChild } from '@angular/core';
import { AppLoop } from '../../providers/app-loop';

interface ITab {
  id: number;
  title: string;
  data: any;
}


class TabsManager {
  datas: Array<ITab>;
  tabs: Slides;
  tabsElements: Array<HTMLElement> = [];
  mSlideBar: HTMLElement;
  mSlideBarContainer: HTMLElement;
  mNumberOfPage: number = 0;
  mCurrentIndex: number = 0;

  properties = {
    translateX: 0,
    targetTranslateX: 0,
    scrollLeft: 0,
    targetScrollLeft: 0,
    threshold: 0.2
  };

  constructor() {

  }

  onUpdate() {
    if (this.properties.scrollLeft != this.properties.targetScrollLeft) {
      let dx = (this.properties.targetScrollLeft - this.properties.scrollLeft);
      if (Math.abs(dx) < this.properties.threshold) {
        this.properties.scrollLeft = this.properties.targetScrollLeft;
      } else {
        this.properties.scrollLeft += this.properties.threshold * dx;
      }
      this.mSlideBarContainer.scrollLeft = this.properties.scrollLeft;
    }

    if (this.properties.translateX != this.properties.targetTranslateX) {
      let dx = (this.properties.targetTranslateX - this.properties.translateX);
      if (Math.abs(dx) < this.properties.threshold) {
        this.properties.translateX = this.properties.targetTranslateX;
      } else {
        this.properties.translateX += this.properties.threshold * dx;
      }
      this.mSlideBar.style.transform = "translateX(" + this.properties.translateX + "px)";
    }
  }
  _Create(slides: Slides, data: Array<ITab>, slidebarID : string) {

    this.tabs = slides;
    this.datas = data;
    this.mSlideBarContainer = document.getElementById(slidebarID);
    if (this.mSlideBarContainer) {
      let childs = this.mSlideBarContainer.getElementsByClassName("slide-toolbar");

      for (let i = 0; i < childs.length; i++) {
        this.tabsElements.push(<HTMLElement>childs.item(i));
      }
      this.mNumberOfPage = childs.length;
      this.mCurrentIndex = 0;
      if (!this.tabsElements[this.mCurrentIndex].classList.contains('tab-active')) this.tabsElements[this.mCurrentIndex].classList.add('tab-active');
      let additionalWidth: number = -1;

      if (this.mSlideBarContainer.scrollWidth <= this.mSlideBarContainer.clientWidth) {
        let sameWidth: number = this.mSlideBarContainer.clientWidth / this.mNumberOfPage;

        let notSameWidth = this.tabsElements.some(element => {
          return element.clientWidth > sameWidth;
        });

        if (notSameWidth) {
          let remainsWidth = this.mSlideBarContainer.clientWidth;
          this.tabsElements.forEach(element => {
            remainsWidth -= element.clientWidth;
          });
          additionalWidth = remainsWidth / this.mNumberOfPage;
          this.tabsElements.forEach(element => {
            element.style.width = Math.floor(element.clientWidth + additionalWidth) + "px";
          });

        } else {
          this.tabsElements.forEach(element => {
            element.style.width = Math.floor(sameWidth) + "px";
          });
        }
      }

      this.mSlideBar = <HTMLElement>(this.mSlideBarContainer.getElementsByClassName("scroll-bar")[0]);
      this.mSlideBar.style.width = this.tabsElements[this.mCurrentIndex].clientWidth + "px";

      this.properties.scrollLeft = this.mSlideBarContainer.scrollLeft;
      this.properties.targetScrollLeft = this.mSlideBarContainer.scrollLeft;
    }
    this.tabs.ionSlideProgress.subscribe(data => {
      this.onSlidesScroll(data);
    });

    AppLoop.getInstance().scheduleUpdate(this);
  }


  _SetSelectedTab(id: number) {
    if (id != this.tabs.getActiveIndex()) {
      if (this.tabsElements[this.mCurrentIndex].classList.contains('tab-active')) this.tabsElements[this.mCurrentIndex].classList.remove('tab-active');
      if (!this.tabsElements[id].classList.contains('tab-active')) this.tabsElements[id].classList.add('tab-active');
      this.mCurrentIndex = id;
      this.tabs.slideTo(id);
    }
  }

  _Clamp(val: number, left: number, right: number): number {
    if (val < left) return left;
    if (val > right) return right;
    return val;
  }
  onSlidesScroll(progress: number) {

    let prog = progress * (this.mNumberOfPage - 1);
    let left = Math.floor(prog);
    let right = Math.ceil(prog);
    left = this._Clamp(left, 0, this.mNumberOfPage - 1);
    right = this._Clamp(right, 0, this.mNumberOfPage - 1);
    let width = 0;
    if (left == right) width = this.getTabWidth(left);
    else width = (this.getTabWidth(right) * (prog - left) + this.getTabWidth(left) * (right - prog));

    this.mSlideBar.style.width = width + "px";
    let translateX = this.getLeftOfTab(left) + (prog - left) * this.getTabWidth(left);
    this.properties.targetTranslateX = translateX;
    let dx = translateX - (this.mSlideBarContainer.clientWidth / 2) + this.getTabWidth(left) / 2;
    dx = this._Clamp(dx, 0, this.mSlideBarContainer.scrollWidth - this.mSlideBarContainer.clientWidth);
    this.properties.targetScrollLeft = dx;

    let newIndex = this.mCurrentIndex;
    if (prog - left >= 0.5) {
      newIndex = right;
    } else {
      newIndex = left;
    }
    if (newIndex != this.mCurrentIndex) {
      if (this.tabsElements[this.mCurrentIndex].classList.contains('tab-active')) this.tabsElements[this.mCurrentIndex].classList.remove('tab-active');
      if (!this.tabsElements[newIndex].classList.contains('tab-active')) this.tabsElements[newIndex].classList.add('tab-active');
      this.mCurrentIndex = newIndex;
    }

  }
  getTabWidth(index: number) {
    if (index < 0 || index >= this.mNumberOfPage) {
      return 0;
    }
    return this.tabsElements[index].clientWidth;
  }
  getCenterOfTab(index: number): number {
    let idx = index;
    if (idx < 0) idx = 0;
    if (idx > this.mNumberOfPage - 1) idx = this.mNumberOfPage - 1;

    return this.tabsElements[idx].clientLeft + this.tabsElements[idx].clientWidth / 2;
  }
  getLeftOfTab(index: number): number {

    let left: number = 0;
    let idx: number = 0;
    while (idx < index && idx < this.mNumberOfPage) {
      left += this.tabsElements[idx].clientWidth;
      idx++;
    }

    return left;
  }

}

@IonicPage()
@Component({
  selector: 'page-home',
  templateUrl: 'home.html',
})
export class HomePage {
  iSlides = [
    {
      id: 0, title: "Tý", data: {
        id: 0
      }
    },
    { id: 1, title: "Bóng đá quốc tế", data: { id: 1 } },
    { id: 2, title: "Dần", data: { id: 2 } },
    { id: 3, title: "Mão", data: { id: 3 } },
    { id: 4, title: "Thìn", data: { id: 4 } },
    { id: 5, title: "Tỵ", data: { id: 5 } },
    {
      id: 6, title: "Ngọ", data: {
        id: 6
      }
    },
    { id: 7, title: "Mùi", data: { id: 7 } }
  ];
  iSlides1 = [
    {
      id: 0, title: "BXH", data: {
        id: 0
      }
    },
    { id: 1, title: "Lich Thi Dau", data: { id: 1 } },
    { id: 2, title: "Ket Qua", data: { id: 2 } },
    { id: 3, title: "Video", data: { id: 3 } },
    { id: 4, title: "Hinh Anh", data: { id: 4 } },
    { id: 5, title: "Tỵ", data: { id: 5 } },
    {
      id: 6, title: "Ngọ", data: {
        id: 6
      }
    },
    { id: 7, title: "Mùi", data: { id: 7 } }
  ];
  @ViewChild('mSlidesContent') mSlides: Slides;
  @ViewChild('slide1') mSlides1: Slides;

  mTabsManager: TabsManager = new TabsManager();
  mTabsManager1: TabsManager = new TabsManager();
  constructor(public navCtrl: NavController, public navParams: NavParams) {

  }
  mActiveIndex: number = 0;

  ngAfterViewInit() {
    // this.mSlides.slideTo(1);
    this.mTabsManager._Create(this.mSlides, this.iSlides,"slides-toolbar");
    this.mTabsManager1._Create(this.mSlides1, this.iSlides1,"slides-toolbar1");
  }
  onClickTab(iSlide: ITab) {
    this.mTabsManager._SetSelectedTab(this.iSlides.indexOf(iSlide));
  }
  onClickTab1(iSlide: ITab) {
    this.mTabsManager1._SetSelectedTab(this.iSlides1.indexOf(iSlide));
  }
}
