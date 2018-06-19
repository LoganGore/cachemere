//INFO AND USAGE IN README.txt

//LRU Cache
class Cachemere{

  constructor(size){
    this.hits=0;
    this.misses=0;
    this.size=size;
    this.count=0;
    this.lruList=new DoublyLinkedList();
    this.lruMap=new Map(); 
    this.cache=new Map();
  }

  //Adds a new item to the cache.
  add(key,value){
    this.updatePosition(key);
    this.cache.set(key,value);
    this.count++;   
  }

  //Updates the LRU order in the lruList.
  updatePosition(key){
    //Update existing node.
    if(this.lruMap.has(key)){
      let node = this.lruMap.get(key);

      //Move middle node to head position in O(1).
      if(node!=this.lruList.head && node!=this.lruList.tail){

        //Remove from existing position.
        node.previous.next=node.next;
        node.next.previous=node.previous;

        //Set as head.
        this.lruList.head.previous=node;
        node.next=this.lruList.head;
        this.lruList.head=node;
        this.lruList.head.previous=null;
      }
      //No need to move head node.
      else if(node==this.lruList.head){ 
        return; 
      }
      //Moving tail node to head position in O(1).
      else if(node==this.lruList.tail){           
        //Modify head.
        this.lruList.head.previous=node;
        node.next=this.lruList.head;      
        this.lruList.head=node;
        
        //Modify tail.
        this.lruList.tail=this.lruList.tail.previous;
        this.lruList.tail.next=null;
      }
      //Problematic, malformed node...throw error.
      else{
        throw new Error("Node in LRU has malformed pointers!");
      }
    }
    //This is a new node that doesn't exist in the cache.
    else{
      //Create new node instance.
      let node = new Node(key);
      
      //Evict if max size is reached.
      if(this.count>=this.size){
        this.evict(this.lruList.tail.value);
      }

      //Actually add to LRU map.
      this.lruMap.set(key,node);
      
      //No nodes. Adding the only node in the cache.
      if(this.lruList.head==null && this.lruList.tail==null){
        this.lruList.tail=node;
        this.lruList.head=node; 
      }
      //One node.
      else if(this.lruList.tail==this.lruList.head){
        this.lruList.tail.previous=node;
        this.lruList.head=node;
        this.lruList.head.next=this.lruList.tail;
      }
      //Multiple nodes.
      else
      {
        this.lruList.head.previous=node;
        node.next=this.lruList.head;
        this.lruList.head=node;  
      }      
    }
  }

  //Returns a value if the key/value is in the cache.
  //Updates lru position.
  getValue(key){
    if(this.cache.has(key)){
      this.updatePosition(key);
      this.hits++;
    }
    else{
      this.misses++;
    }
    return this.cache.get(key);
  }

  //Returns a value if the key/value is in the cache.
  //If not, calls the fallback function and adds the result of the fallback to the cache.
  proxyGet(key, fallback){
    if(this.lruMap.has(key)){
      return this.getValue(key);
    }
    else
    {
      let v = fallback();
      this.add(key,v);
      return v;
    }
  }


  evict(key){
    //Get node from the lruMap in O(1) time.
    let node = this.lruMap.get(key);
      
    //Manipulate node pointers to remove from lruList
    //
    //Head node
    if(node==this.lruList.head){ 
      if(this.count>1){
        this.lruList.head=node.next;
        node.next.previous=this.lruList.head;
      }
      else
      {
        this.lruList.head=null;
        this.lruList.tail=null;
      }
    }
    //Tail node
    else if(node==this.lruList.tail){
      this.lruList.tail=node.previous; 
      this.lruList.tail.next=null;
    }
    else{
      prev.next=node.next;
      next.previous=node.previous;    
    }
   
    //Decrement count property.
    this.count--;

    //Remove from lru map.
    this.lruMap.delete(key);
    
    //Remove from cache map and return the removed value.
    return this.cache.delete(key).value;
  }

  contains(key){
    return this.cache.has(key);
  }
}


//Node class for doubly linked list.
class Node{
  constructor(value){
    this.value=value;
    this.next=null;
    this.previous=null;
  }
}

//Sparse skeleton of doubly linked list.
class DoublyLinkedList{
  constructor(){
    this.head=null;
    this.tail=null;
  }  
  
  forEach(func){
    let node=this.head;
    while(node!=null){
      func(node.value);
      if(node!=this.tail)
        node=node.next;
      else
        break;      
    }
  } 
}