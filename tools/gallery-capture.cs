// Capture-only instrumentation for an isolated worktree and save profile.
using Godot; using System; using System.Linq;
namespace Mori;
public partial class GardenGame {
private int galleryFrame;
private void GalleryTick(){
 galleryFrame++;
 if(galleryFrame==1){pet.IsEgg=false;OnLifeChanged();SetPreviewPosition();recentCardTime=0;showStats=false;cameraRig.Distance=14;cameraRig.Pitch=.6f;}
 if(galleryFrame==75)GalleryShot("01-garden");
 if(galleryFrame==76){showStats=true;UpdateUi();}
 if(galleryFrame==110)GalleryShot("03-status");
 if(galleryFrame==111){showStats=false;carrying=true;SwitchZone(GardenZone.CoastalCove);carrying=false;player.Position=new(1,0,-3);cameraRig.Yaw=Mathf.Pi-.35f;cameraRig.Distance=10;cameraRig.Pitch=.4f;cameraRig.Follow(player.Position,0,true);UpdateUi();}
 if(galleryFrame==160)GalleryShot("02-coastal-cove");
 if(galleryFrame==161){SwitchZone(GardenZone.Lobby);player.Position=ZoneArt.PlazaShop+new Vector3(0,0,2);cameraRig.Yaw=0;cameraRig.Distance=9;cameraRig.Pitch=.4f;cameraRig.Follow(player.Position,0,true);shopOpen=true;UpdateUi();}
 if(galleryFrame==200)GalleryShot("05-shop");
 if(galleryFrame==201){pet.Stars=20;shopColor=GardenEgg.Colors.Length+1;BuyShopItem();shopColor=GardenEgg.Colors.Length+1+FruitKinds.Special.Length;BuyShopItem();shopOpen=false;showBag=true;UpdateUi();}
 if(galleryFrame==240)GalleryShot("04-inventory");
 if(galleryFrame==241){showBag=false;SwitchZone(GardenZone.Garden);var tree=world.GetChildren().OfType<FruitTree>().First(t=>!t.IsFeeder);player.Position=tree.Position+new Vector3(0,0,5);cameraRig.Yaw=0;cameraRig.Pitch=.5f;cameraRig.Distance=10;cameraRig.Follow(player.Position,0,true);UpdateUi();}
 if(galleryFrame==290)GalleryShot("06-trees");
 if(galleryFrame==291){showBag=true;UpdateUi();bagFruits.Select(0);TakeSelectedFruit();cameraRig.Distance=4;cameraRig.Pitch=.2f;cameraRig.Follow(player.Position,0,true);}
 if(galleryFrame==335)GalleryShot("07-item-handling");
 if(galleryFrame==336){paused=true;ShowSlotMenu(SlotMode.Save);saveSlots.Select(0);SaveToSlot();UpdateUi();}
 if(galleryFrame==380)GalleryShot("08-save-slots");
 if(galleryFrame==381){GD.Print("GALLERY_CAPTURE_COMPLETE");GetTree().Quit();}
 HideModels(this);playerArt.Hide();mainName.Hide();
}
private static void HideModels(Node n){if(n is ImportedChao c)c.Hide();foreach(Node child in n.GetChildren())HideModels(child);}
private void GalleryShot(string name){var dir=ProjectSettings.GlobalizePath("res://artifacts/safe");System.IO.Directory.CreateDirectory(dir);GD.Print("CAPTURE "+name+" "+GetViewport().GetTexture().GetImage().SavePng(dir+"/"+name+".png"));}
}