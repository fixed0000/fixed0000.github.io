// Capture-only partial class for a detached MoriGarden worktree, never production.
// Uses actual game scenes, interactions and UI. It does not synthesize images.
using Godot;
using System;
using System.Linq;
namespace Mori;
public partial class GardenGame
{
 private int galleryFrame;
 private bool SafeGallery => OS.GetCmdlineUserArgs().Contains("--safe-gallery");
 private void GalleryTick()
 {
  galleryFrame++;
  if(galleryFrame==1){pet.IsEgg=false;OnLifeChanged();SetPreviewPosition();cameraRig.Distance=14;cameraRig.Pitch=.6f;}
  if(galleryFrame==60)GalleryShot("01-garden");
  if(galleryFrame==61){cameraRig.Distance=5;cameraRig.Pitch=.3f;cameraRig.Yaw=-.6f;}
  if(galleryFrame==100)GalleryShot("02-character");
  if(galleryFrame==101){friend.Position=player.Position+new Vector3(.7f,0,.8f);wanderTarget=friend.Position;wanderTime=100;PetFriend();}
  if(galleryFrame==120)GalleryShot("03-interaction");
  if(galleryFrame==121){showStats=true;UpdateUi();}
  if(galleryFrame==160)GalleryShot("04-interface");
  if(galleryFrame==161){showStats=false;showBag=true;UpdateUi();}
  if(galleryFrame==200)GalleryShot("05-inventory");
  if(galleryFrame==201){showBag=false;carrying=true;SwitchZone(GardenZone.CoastalCove);carrying=false;player.Position=new(1,0,-3);cameraRig.Yaw=Mathf.Pi-.35f;cameraRig.Distance=10;cameraRig.Pitch=.4f;cameraRig.Follow(player.Position,0,true);UpdateUi();}
  if(galleryFrame==250)GalleryShot("06-coastal-cove");
  if(galleryFrame==251){GD.Print("GALLERY_CAPTURE_COMPLETE safe="+SafeGallery);GetTree().Quit();}
  // Hide only render nodes in the alternative run; all simulation and UI stay live.
  if(SafeGallery){HideModels(this);playerArt.Hide();mainName.Hide();}
 }
 private static void HideModels(Node n){if(n is ImportedChao c)c.Hide();foreach(Node child in n.GetChildren())HideModels(child);}
 private void GalleryShot(string name){var dir=ProjectSettings.GlobalizePath("res://artifacts/"+(SafeGallery?"safe":"original"));System.IO.Directory.CreateDirectory(dir);var path=dir+"/"+name+".png";var error=GetViewport().GetTexture().GetImage().SavePng(path);GD.Print("CAPTURE "+path+" "+error);}
}
