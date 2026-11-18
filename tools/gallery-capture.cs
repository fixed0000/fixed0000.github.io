// Capture-only camera and real input actions in a detached game worktree.
using Godot;using System;using System.Linq;
namespace Mori;
public partial class GardenGame {
private int galleryFrame;
private void GalleryTick(){
 galleryFrame++;
 if(galleryFrame==1){pet.IsEgg=false;OnLifeChanged();SetPreviewPosition();recentCardTime=0;showStats=false;cameraRig.Distance=11;cameraRig.Pitch=.45f;cameraRig.Yaw=-.25f;}
 if(galleryFrame==80)GalleryShot("01-garden-new");
 if(galleryFrame==81){SwitchZone(GardenZone.Lobby);player.Position=ZoneArt.PlazaShop+new Vector3(1.6f,0,1.7f);cameraRig.Yaw=.45f;cameraRig.Distance=5.2f;cameraRig.Pitch=.28f;cameraRig.Follow(player.Position,0,true);shopOpen=true;shopColor=GardenEgg.Colors.Length+1+Array.IndexOf(FruitKinds.Special,FruitKinds.Red);UpdateUi();}
 if(galleryFrame==150)GalleryShot("05-shop-new");
 if(galleryFrame==151){BuyShopItem();shopOpen=false;SwitchZone(GardenZone.Garden);player.Position=new(0,0,4);player.Rotation=Vector3.Zero;showBag=true;UpdateUi();bagFruits.Select(Array.IndexOf(FruitKinds.BagKinds,FruitKinds.Red));TakeSelectedFruit();cameraRig.Distance=2.1f;cameraRig.Pitch=.08f;cameraRig.Yaw=Mathf.Pi-.4f;cameraRig.Follow(player.Position,0,true);UpdateUi();}
 if(galleryFrame==215)GalleryShot("07-item-new");
 if(galleryFrame==216){if(heldFruit!=null){heldFruit.Place(player.Position+new Vector3(0,.2f,1));heldFruit=null;}cameraRig.Distance=3.2f;cameraRig.Pitch=.28f;cameraRig.Yaw=.2f;cameraRig.Follow(player.Position,0,true);UpdateUi();}
 if(galleryFrame==275)GalleryShot("07-item-placed");
 if(galleryFrame==276){GD.Print("GALLERY_AUDIT_COMPLETE");GetTree().Quit();}
 HideModels(this);playerArt.Hide();mainName.Hide();
}
private static void HideModels(Node n){if(n is ImportedChao c)c.Hide();foreach(Node child in n.GetChildren())HideModels(child);}
private void GalleryShot(string name){var dir=ProjectSettings.GlobalizePath("res://artifacts/final-audit");System.IO.Directory.CreateDirectory(dir);GD.Print("CAPTURE "+name+" "+GetViewport().GetTexture().GetImage().SavePng(dir+"/"+name+".png"));}
}
